// WayForPay test-mode "Buy" buttons (the plan cards' "Купити підписку" CTAs
// were dead `href="#"` links before this - see src/partials/sections/plans.html).
// Docs: https://wiki.wayforpay.com/en/view/852091 (widget), /en/view/852102
// (merchantSignature algorithm), /en/view/852472 (sandbox credentials).
//
// IMPORTANT - this only works client-side because these are WayForPay's own
// publicly-published sandbox credentials (anyone testing their integration
// uses this exact merchantAccount/secret; it isn't this project's secret).
// A real merchant account's secret key must NEVER ship in browser JS: an
// HMAC computed client-side can be read out of the page and used to forge
// signed requests. Going live means moving `buildSignature` to a server
// endpoint that takes the order details and returns just the signature -
// this file's shape (config in, signature out) is written so that swap is a
// single function call, not a rewrite.
const TEST_MERCHANT = {
  merchantAccount: "test_merch_n1",
  merchantSecretKey: "flk3409refn54t54t*FNJRET",
};

// --- HMAC-MD5 -----------------------------------------------------------
// WayForPay signs with HMAC-MD5, which the browser's native SubtleCrypto
// doesn't implement (it only offers the SHA family) - this is a small
// vendored MD5 (RFC 1321), verified byte-for-byte against Node's `crypto`
// module for empty/short/long/multi-byte-UTF8 inputs and the worked example
// from the docs before this shipped.
function md5(bytes) {
  const rotl = (x, c) => (x << c) | (x >>> (32 - c));
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;
  // prettier-ignore
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const msgLen = bytes.length;
  const bitLenLow = (msgLen * 8) >>> 0;
  const bitLenHigh = Math.floor((msgLen * 8) / 2 ** 32) >>> 0;

  const padded = Array.from(bytes);
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  for (const v of [bitLenLow, bitLenHigh]) {
    padded.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }

  let a0 = 0x67452301,
    b0 = 0xefcdab89,
    c0 = 0x98badcfe,
    d0 = 0x10325476;

  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      const o = chunk + j * 4;
      M[j] = padded[o] | (padded[o + 1] << 8) | (padded[o + 2] << 16) | (padded[o + 3] << 24);
    }
    let A = a0,
      B = b0,
      C = c0,
      D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, S[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const toHexLE = (n) => {
    let s = "";
    for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    return s;
  };
  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function hmacMd5(message, key) {
  const blockSize = 64;
  const enc = new TextEncoder();
  let keyBytes = enc.encode(key);
  if (keyBytes.length > blockSize) keyBytes = hexToBytes(md5(keyBytes));
  const padded = new Uint8Array(blockSize);
  padded.set(keyBytes);

  const ipad = padded.map((b) => b ^ 0x36);
  const opad = padded.map((b) => b ^ 0x5c);
  const msgBytes = enc.encode(message);

  const inner = md5(concatBytes(ipad, msgBytes));
  const outer = md5(concatBytes(opad, hexToBytes(inner)));
  return outer;
}

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

// --- WayForPay request building -----------------------------------------
function buildSignature({
  merchantDomainName,
  orderReference,
  orderDate,
  amount,
  currency,
  productName,
  productCount,
  productPrice,
}) {
  const fields = [
    TEST_MERCHANT.merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate,
    amount,
    currency,
    productName,
    productCount,
    productPrice,
  ];
  return hmacMd5(fields.join(";"), TEST_MERCHANT.merchantSecretKey);
}

function payWith(button) {
  const productName = button.dataset.wfpProduct;
  const amount = button.dataset.wfpAmount;
  const currency = button.dataset.wfpCurrency || "USD";
  const merchantDomainName = location.hostname || "localhost";
  const orderReference = `test-${Date.now()}`;
  const orderDate = Math.floor(Date.now() / 1000);

  const fields = {
    merchantDomainName,
    orderReference,
    orderDate,
    amount,
    currency,
    productName,
    productCount: "1",
    productPrice: amount,
  };

  const wayforpay = new window.Wayforpay();
  wayforpay.run(
    {
      merchantAccount: TEST_MERCHANT.merchantAccount,
      merchantDomainName,
      authorizationType: "SimpleSignature",
      merchantSignature: buildSignature(fields),
      orderReference,
      orderDate: String(orderDate),
      amount: String(amount),
      currency,
      productName,
      productPrice: String(amount),
      productCount: "1",
      clientFirstName: "Test",
      clientLastName: "Buyer",
      clientEmail: "test@example.com",
      clientPhone: "380000000000",
      language: "UA",
    },
    (response) => setStatus(button, "approved", response),
    (response) => setStatus(button, "declined", response),
    (response) => setStatus(button, "pending", response),
  );
}

function setStatus(button, kind, response) {
  const labels = {
    approved: "Оплату test-режиму підтверджено ✓",
    declined: "Тестову оплату відхилено",
    pending: "Тестова оплата обробляється…",
  };
  let status = button.parentElement.querySelector(".wfp-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "wfp-status";
    button.insertAdjacentElement("afterend", status);
  }
  status.textContent = labels[kind] ?? kind;
  status.dataset.wfpKind = kind;
  // eslint-disable-next-line no-console
  console.log("[wayforpay:test]", kind, response);
}

export function initWayforpay() {
  const buttons = document.querySelectorAll("[data-wfp-pay]");
  if (!buttons.length) return;

  if (typeof window.Wayforpay !== "function") {
    // eslint-disable-next-line no-console
    console.warn(
      "[wayforpay] pay-widget.js hasn't loaded (blocked, offline, or removed from index.html) - test-pay buttons are inert.",
    );
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      payWith(button);
    });
  });
}
