export type ConsultationText = {
  code: string
  content: string
}

export function findConsultationText(texts: ConsultationText[], code: string): string | null {
  return texts.find((item) => item.code === code)?.content ?? null
}
