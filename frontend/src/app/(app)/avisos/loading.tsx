import { ListCardSkeleton, LoadingRegion, PageHeaderSkeleton } from "@/components/skeletons/pieces"

/** A forma de Avisos: a lista à esquerda, o estoque abaixo do mínimo à direita */
export default function AvisosLoading() {
  return (
    <LoadingRegion label="Carregando os avisos">
      <PageHeaderSkeleton actions={0} />
      <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-6">
        <ListCardSkeleton rows={6} action className="lg:col-span-7" />
        <ListCardSkeleton rows={5} className="lg:col-span-5" />
      </div>
    </LoadingRegion>
  )
}
