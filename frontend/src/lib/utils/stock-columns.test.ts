/**
 * Leitura da escolha de colunas do estoque. O cookie vem do navegador, então
 * pode chegar vazio, adulterado ou de uma versão antiga da tela.
 */

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseColumns } from "./stock-columns.ts"

describe("parseColumns", () => {
  it("sem cookie, só as colunas padrão", () => {
    assert.deepEqual(parseColumns(undefined), [])
    assert.deepEqual(parseColumns(""), [])
  })

  it("devolve na ordem da tabela, não na ordem em que foram marcadas", () => {
    assert.deepEqual(parseColumns("custo,pasta"), ["pasta", "custo"])
  })

  it("ignora nome desconhecido e repetido", () => {
    assert.deepEqual(parseColumns("lote,lote,senha,<script>"), ["lote"])
  })

  it("tolera espaço em volta", () => {
    assert.deepEqual(parseColumns(" codigo , minimo "), ["codigo", "minimo"])
  })
})
