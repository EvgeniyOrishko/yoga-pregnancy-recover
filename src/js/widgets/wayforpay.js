// WayForPay test-mode "Buy" buttons (the plan cards' "Купити підписку" CTAs
// were dead `href="#"` links before this - see src/partials/sections/plans.html).
//
// This posts to WayForPay's hosted "Purchase" checkout page rather than
// using their embedded pay-widget.js modal. That switch is deliberate, not
// a stylistic choice: Apple Pay / Google Pay showed up nowhere in the
// widget on a real iPhone. Two things point at the widget being the wrong
// surface for that rather than a config problem here:
//   - `paymentSystems` (the parameter that lists which methods to offer -
//     card;applePay;googlePay;...) is documented only for this hosted-page
//     "Purchase" flow (https://wiki.wayforpay.com/en/view/852102), never for
//     pay-widget.js (https://wiki.wayforpay.com/en/view/852091) - it may not
//     exist for the widget at all.
//   - Apple Pay's own JS API (ApplePaySession, which WayForPay's checkout UI
//     uses under the hood) needs the page running it to be the top-level
//     document; pay-widget.js renders its checkout inside an iframe/modal,
//     which is exactly the situation Apple Pay is commonly unavailable in.
// A real top-level navigation to WayForPay's own hosted page sidesteps both.
//
// Docs: https://wiki.wayforpay.com/en/view/852102 (this endpoint, its fields,
// merchantSignature algorithm), /en/view/852472 (sandbox credentials),
// help.wayforpay.com/en/apple-pay and /en/google-pay (merchant enablement).
//
// IMPORTANT - this only works client-side because these are WayForPay's own
// publicly-published sandbox credentials (anyone testing their integration
// uses this exact merchantAccount/secret; it isn't this project's secret).
// A real merchant account's secret key must NEVER ship in browser JS: an
// HMAC computed client-side can be read out of the page and used to forge
// signed requests. Going live means moving `buildSignature` to a server
// endpoint that takes the order details and returns just the signature -
// this file's shape (order fields in, signature out) is written so that
// swap is a small function call, not a rewrite.
const TEST_MERCHANT = {
  merchantAccount: "test_merch_n1",
  merchantSecretKey: "flk3409refn54t54t*FNJRET",
};
const CHECKOUT_URL = "https://secure.wayforpay.com/pay";

// Deliberately trivial for now - the actual ask that led to this file's
// current shape was "does Apple Pay show up at all", not "test the real
// plan price". Swap for `button.dataset.wfpAmount` (the real plan price -
// still present in the markup) once that's confirmed working.
const TEST_AMOUNT = "0.50";

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

// --- WayForPay request building -------------------------------------------
// Same field order/algorithm as the widget used (unchanged, still verified):
// HMAC-MD5 of merchantAccount;merchantDomainName;orderReference;orderDate;
// amount;currency;productName;productCount;productPrice, hex-encoded.
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

function addField(form, name, value) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function payWith(button) {
  const productName = button.dataset.wfpProduct;
  const amount = TEST_AMOUNT;
  const currency = button.dataset.wfpCurrency || "USD";
  const merchantDomainName = location.hostname || "localhost";
  const orderReference = `test-${Date.now()}`;
  const orderDate = String(Math.floor(Date.now() / 1000));

  const signature = buildSignature({
    merchantDomainName,
    orderReference,
    orderDate,
    amount,
    currency,
    productName,
    productCount: "1",
    productPrice: amount,
  });

  // So the page can show a "we're back from checkout" note - WayForPay
  // doesn't document what it appends to returnUrl, and confirming the real
  // outcome needs the serviceUrl server-side webhook, which this static
  // site doesn't have. Don't claim a status this can't actually verify.
  sessionStorage.setItem("wfp-pending-order", JSON.stringify({ orderReference, productName }));

  const form = document.createElement("form");
  form.method = "POST";
  form.action = CHECKOUT_URL;
  form.acceptCharset = "utf-8";

  addField(form, "merchantAccount", TEST_MERCHANT.merchantAccount);
  addField(form, "merchantAuthType", "SimpleSignature");
  addField(form, "merchantDomainName", merchantDomainName);
  addField(form, "merchantTransactionSecureType", "AUTO");
  addField(form, "merchantSignature", signature);
  addField(form, "orderReference", orderReference);
  addField(form, "orderDate", orderDate);
  addField(form, "amount", amount);
  addField(form, "currency", currency);
  addField(form, "productName[]", productName);
  addField(form, "productPrice[]", amount);
  addField(form, "productCount[]", "1");
  addField(form, "clientFirstName", "Test");
  addField(form, "clientLastName", "Buyer");
  addField(form, "clientEmail", "test@example.com");
  addField(form, "clientPhone", "380000000000");
  addField(form, "language", "UA");
  // Explicit rather than relying on "defaults to everything enabled for the
  // merchant" - this is exactly the parameter this whole switch was about.
  addField(form, "paymentSystems", "card;applePay;googlePay");
  addField(form, "returnUrl", `${location.origin}${location.pathname}#Memberships`);

  document.body.appendChild(form);
  form.submit();
}

function showReturnStatus() {
  const raw = sessionStorage.getItem("wfp-pending-order");
  if (!raw) return;
  sessionStorage.removeItem("wfp-pending-order");

  let pending;
  try {
    pending = JSON.parse(raw);
  } catch {
    return;
  }
  const button = Array.from(document.querySelectorAll("[data-wfp-pay]")).find(
    (b) => b.dataset.wfpProduct === pending.productName,
  );
  if (!button) return;

  let status = button.parentElement.querySelector(".wfp-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "wfp-status";
    button.insertAdjacentElement("afterend", status);
  }
  status.dataset.wfpKind = "pending";
  status.textContent =
    "Повернулись із тестової оплати WayForPay. Реальний фінальний статус потребує serviceUrl-вебхука на бекенді - його тут немає, це лише підтвердження, що чекаут відкрився.";
}

export function initWayforpay() {
  const buttons = document.querySelectorAll("[data-wfp-pay]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      payWith(button);
    });
  });

  showReturnStatus();
}
