import { CircleX, FileSpreadsheet } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { formatFileSize } from "@/lib/utils/import-draft"

export type UploadFile = { name: string; size: number; received: number; failed: boolean }

/**
 * Cada planilha numa linha, com nome, tamanho e a barra do envio (issue 075,
 * itens 35 e 37), como o Upload Files Design (Behance). A barra anda conforme
 * as partes de 1 MB chegam ao servidor: é progresso de verdade, não animação.
 */
export function UploadFiles({ files }: { files: UploadFile[] }) {
  return (
    <ul className="mx-auto flex w-full max-w-md flex-col gap-2 text-left">
      {files.map((file) => {
        const percent = file.size > 0 ? Math.round((file.received / file.size) * 100) : 100
        return (
          <li
            key={file.name}
            className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3"
          >
            {file.failed ? (
              <CircleX className="size-5 shrink-0 text-error" aria-hidden />
            ) : (
              <FileSpreadsheet className="size-5 shrink-0 text-fg-muted" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-body font-medium text-fg">{file.name}</p>
                <span className="shrink-0 text-label text-fg-muted tnum">{percent}%</span>
              </div>
              <Progress
                value={file.received}
                max={Math.max(file.size, 1)}
                label={`${file.name}: ${percent}% enviado`}
                className="mt-1.5 h-1.5"
              />
              <p className="mt-1 text-label text-fg-muted tnum">
                {file.received === 0 ? "0 KB" : formatFileSize(file.received)} de {formatFileSize(file.size)}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
