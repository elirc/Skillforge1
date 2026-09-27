interface IncomingRequest {
  contentType: string; // the Content-Type header, e.g. "application/json; charset=utf-8"
  body: string; // the raw body text
}

// Validate a POST /products request in the order a real pipeline does:
//
// 1. Media type: the part of contentType before any ";", trimmed and lowercased,
//    must be "application/json". Otherwise return { status: 415 }.
// 2. Syntax: JSON.parse the body. If it throws, return { status: 400, title: "Malformed JSON" }.
//    If the result is not a plain object (null, an array, a string, a number...),
//    return { status: 400, title: "Body must be a JSON object" }.
// 3. Fields: collect EVERY problem (do not stop at the first) into errors,
//    with keys in the order name, price, sku, each holding an array with one message:
//    - name: must be a string that is non-empty after trimming -> "Name is required."
//            and at most 100 characters after trimming -> "Name must be at most 100 characters."
//    - price: must be a finite number greater than 0 -> "Price must be a positive number."
//    - sku: must be a string like "ABC-1234" (3 uppercase letters, "-", 4 digits)
//           -> "SKU must look like ABC-1234."
//    If there are errors: { status: 400, title: "One or more validation errors occurred.", errors }
// 4. Success: { status: 201, product: { name (trimmed), price, sku } }.
//    Copy only those three fields: extra fields in the body are ignored (no over-posting).
export function validateCreateProduct(request: IncomingRequest) {
}
