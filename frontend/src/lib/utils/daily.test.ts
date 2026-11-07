import { test } from "node:test"
import assert from "node:assert/strict"
import { daily } from "./daily.ts"

test("daily guarda o valor no mesmo dia e refaz quando o dia muda", () => {
  let now = new Date(Date.UTC(2026, 9, 10))
  let builds = 0
  const value = daily(
    () => ++builds,
    () => now,
  )
  assert.equal(value(), 1)
  assert.equal(value(), 1)
  now = new Date(Date.UTC(2026, 9, 11))
  assert.equal(value(), 2)
  assert.equal(value(), 2)
})
