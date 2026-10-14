import { useEffect, useState } from 'react'
import { deleteProject, listProjects, loadProject } from '../io/projectStorage'
import { useEditorStore } from '../store/useEditorStore'
import type { DocumentMeta } from '../types/DocumentMeta'

const PREVIEW_HEIGHT = 104

const dateFormat = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function HomeScreen() {
  const [projects, setProjects] = useState<DocumentMeta[] | null>(null)
  const openDialog = useEditorStore((s) => s.openDialog)
  const openDocument = useEditorStore((s) => s.openDocument)
  const removeDocument = useEditorStore((s) => s.removeDocument)

  useEffect(() => {
    let cancelled = false
    listProjects()
      .then((list) => {
        if (!cancelled) setProjects(list)
      })
      .catch(() => {
        if (!cancelled) setProjects([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleOpen(id: string) {
    const inMemory = useEditorStore
      .getState()
      .documents.find((d) => d.id === id)
    const doc = inMemory ?? (await loadProject(id))
    if (doc) openDocument(doc)
  }

  async function handleDelete(project: DocumentMeta) {
    if (!window.confirm(`Видалити «${project.title}»? Це не можна скасувати.`)) {
      return
    }
    await deleteProject(project.id)
    removeDocument(project.id)
    setProjects((list) => list?.filter((p) => p.id !== project.id) ?? null)
  }

  return (
    <div className="h-screen overflow-y-auto bg-neutral-900 text-neutral-200">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-8 py-14">
        <header className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">Редактор</h1>
            <p className="mt-1 text-neutral-400">
              Створи новий документ або продовжи роботу над попереднім.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openDialog('newDocument')}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-sky-400"
          >
            Новий документ
          </button>
        </header>

        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="mb-4 text-lg font-medium">
            Нещодавні
          </h2>

          {projects === null && (
            <p className="text-neutral-400">Завантаження…</p>
          )}

          {projects?.length === 0 && (
            <p className="rounded-lg border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
              Збережених документів поки немає. Натисни «Новий документ», щоб
              почати.
            </p>
          )}

          {projects && projects.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {projects.map((p) => (
                <li key={p.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => handleOpen(p.id)}
                    className="w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 text-left hover:border-neutral-500"
                  >
                    <div
                      className="flex items-center justify-center bg-neutral-950 p-3"
                      style={{ height: PREVIEW_HEIGHT + 24 }}
                    >
                      <div
                        className={`ring-1 ring-black ${
                          p.background === 'transparent'
                            ? 'checkerboard'
                            : 'bg-white'
                        }`}
                        style={{
                          aspectRatio: `${p.width} / ${p.height}`,
                          width: `min(100%, ${(PREVIEW_HEIGHT * p.width) / p.height}px)`,
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-neutral-400">
                        {p.width} × {p.height} px
                      </p>
                      <p className="text-xs text-neutral-500">
                        {dateFormat.format(p.updatedAt)}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Видалити ${p.title}`}
                    title="Видалити"
                    onClick={() => handleDelete(p)}
                    className="absolute right-2 top-2 rounded bg-neutral-900/80 px-2 py-0.5 text-sm opacity-0 hover:bg-red-500 focus:opacity-100 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}