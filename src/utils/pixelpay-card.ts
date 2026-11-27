export type SandboxCard = {
  number: string
  cardholder: string
  expireMonth: string
  expireYear: string
  cvv: string
}

export function validateSandboxCard(input: unknown): SandboxCard {
  if (
    typeof input !== "object" ||
    input === null ||
    !("number" in input) ||
    !("cardholder" in input) ||
    !("expireMonth" in input) ||
    !("expireYear" in input) ||
    !("cvv" in input) ||
    typeof input.number !== "string" ||
    typeof input.cardholder !== "string" ||
    typeof input.expireMonth !== "string" ||
    typeof input.expireYear !== "string" ||
    typeof input.cvv !== "string"
  ) {
    throw new Error("Completa los datos de la tarjeta de prueba.")
  }

  const card = {
    number: input.number.replace(/[ -]/g, ""),
    cardholder: input.cardholder.trim(),
    expireMonth: input.expireMonth.trim(),
    expireYear: input.expireYear.trim(),
    cvv: input.cvv.trim(),
  }
  if (
    card.number !== "4111111111111111" ||
    card.cardholder !== "Sandbox Test" ||
    card.expireMonth !== "12" ||
    card.expireYear !== "30" ||
    card.cvv !== "999"
  ) {
    throw new Error("Usa únicamente los datos de prueba indicados.")
  }
  return card
}
