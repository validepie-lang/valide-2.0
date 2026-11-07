"use client"

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card"
import { Field, Input, InputAffix, Select } from "@/components/ui/field"
import { PRODUCT_FIELD_IDS } from "@/components/products/product-form-state"
import type { ProductDraft, ProductDraftErrors } from "@/lib/utils/product-draft"
import type { Folder } from "@/lib/types"

/**
 * Os três cartões de dados do produto (issue 026), separados do formulário na
 * issue 055, que passava de 200 linhas. Campos sem estado: o formulário lê
 * tudo pelo `name` ao enviar e enquanto se corrige.
 */
export function ProductFields({
  initial,
  folders,
  errors,
  belowCost,
  readOnly,
}: {
  initial: ProductDraft
  folders: Folder[]
  errors: ProductDraftErrors
  /** preço de venda abaixo do custo: aviso, não bloqueio (business-rules.md seção 8) */
  belowCost: boolean
  readOnly: boolean
}) {
  /** Os atributos de cada campo: id, name, valor inicial, erro apontado e só leitura ao salvar */
  const control = (key: keyof ProductDraft, describe = false) => ({
    id: PRODUCT_FIELD_IDS[key],
    name: key,
    defaultValue: initial[key],
    invalid: Boolean(errors[key]),
    "aria-describedby": errors[key] || describe ? `${PRODUCT_FIELD_IDS[key]}-mensagem` : undefined,
    readOnly,
  })
  // Pasta e unidade não têm erro possível, e select não tem só leitura
  const select = (key: keyof ProductDraft) => ({
    id: PRODUCT_FIELD_IDS[key],
    name: key,
    defaultValue: initial[key],
  })

  return (
    <>
      <Card id="dados" className="scroll-mt-24">
        <CardTitle>Dados do produto</CardTitle>
        <CardSubtitle>
          O nome é o que sua equipe vai procurar na busca. Escreva como está na caixa.
        </CardSubtitle>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome do produto"
            htmlFor="nome"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <Input {...control("name")} placeholder="Ex.: Dipirona Sódica 500mg" />
          </Field>
          <Field
            label="Código interno"
            htmlFor="sku"
            hint="O código que você já usa na loja"
            error={errors.sku}
          >
            <Input {...control("sku", true)} placeholder="Ex.: MED-1040" />
          </Field>
          <Field
            label="Código de barras"
            htmlFor="ean"
            hint="Os 13 números abaixo do código"
            error={errors.barcode}
          >
            <Input {...control("barcode", true)} inputMode="numeric" />
          </Field>
          <Field label="Pasta de classificação" htmlFor="pasta">
            <Select {...select("folderId")}>
              <option value="">Sem pasta</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Marca" htmlFor="marca">
            <Input {...control("brand")} placeholder="Ex.: Neo Química" />
          </Field>
          <Field label="Fornecedor" htmlFor="fornecedor" className="sm:col-span-2">
            <Input {...control("supplier")} placeholder="Ex.: Distribuidora Panarello" />
          </Field>
        </div>
      </Card>

      <Card id="estoque" className="scroll-mt-24">
        <CardTitle>Parâmetros de estoque</CardTitle>
        <CardSubtitle>O estoque mínimo é o número que dispara o aviso de reposição.</CardSubtitle>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Unidade de medida" htmlFor="unidade">
            <Select {...select("unit")}>
              <option value="un">Unidade</option>
              <option value="kg">Quilo</option>
              <option value="cx">Caixa</option>
            </Select>
          </Field>
          <Field label="Estoque mínimo" htmlFor="minimo" error={errors.minStock}>
            <Input {...control("minStock")} type="number" min={0} inputMode="numeric" className="tnum" />
          </Field>
          <Field label="Estoque máximo" htmlFor="maximo" hint="Opcional" error={errors.maxStock}>
            <Input
              {...control("maxStock", true)}
              type="number"
              min={0}
              inputMode="numeric"
              className="tnum"
            />
          </Field>
        </div>
      </Card>

      <Card id="valores" className="scroll-mt-24">
        <CardTitle>Valores</CardTitle>
        <CardSubtitle>
          O custo de aquisição é o que o painel usa para calcular quanto você tem parado em produtos a vencer.
        </CardSubtitle>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Custo de aquisição" htmlFor="custo" required error={errors.acquisitionCost}>
            <InputAffix affix="R$">
              <Input {...control("acquisitionCost")} inputMode="decimal" className="tnum" />
            </InputAffix>
          </Field>
          <Field
            label="Custos operacionais"
            htmlFor="operacional"
            hint="Opcional"
            error={errors.operationalCost}
          >
            <InputAffix affix="R$">
              <Input {...control("operationalCost", true)} inputMode="decimal" className="tnum" />
            </InputAffix>
          </Field>
          <Field
            label="Preço de venda"
            htmlFor="venda"
            required
            error={errors.salePrice}
            hint={
              belowCost
                ? "Abaixo do custo de aquisição. Dá para salvar assim, se for de propósito."
                : undefined
            }
          >
            <InputAffix affix="R$">
              <Input {...control("salePrice", belowCost)} inputMode="decimal" className="tnum" />
            </InputAffix>
          </Field>
        </div>
      </Card>
    </>
  )
}
