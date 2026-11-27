import assert from "node:assert/strict"
import { test } from "node:test"
import { validateSandboxCard } from "./pixelpay-card.ts"

const card = {
  number: "4111 1111 1111 1111",
  cardholder: "Sandbox Test",
  expireMonth: "12",
  expireYear: "30",
  cvv: "999",
}

test("accepts and normalizes the documented sandbox card", () => {
  assert.deepEqual(validateSandboxCard(card), {
    ...card,
    number: "4111111111111111",
  })
})

test("rejects other card details before sending them", () => {
  for (const input of [
    { ...card, number: "5555555555554444" },
    { ...card, cardholder: "Another Name" },
    { ...card, expireMonth: "01" },
    { ...card, expireYear: "29" },
    { ...card, cvv: "123" },
    { ...card, cvv: null },
    null,
  ]) {
    assert.throws(() => validateSandboxCard(input))
  }
})
