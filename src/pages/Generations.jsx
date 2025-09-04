import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Generations() {
  const navigate = useNavigate()
  const [savedGenerations, setSavedGenerations] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [pageSize] = React.useState(8)
  const [previewSrc, setPreviewSrc] = React.useState(null)

  async function loadPage(p = 0) {
    if (!supabase) return
    try {
      const from = p * pageSize
      const to = from + pageSize - 1
      const { data, error } = await supabase
        .from('generations')
        .select('id, prompt, aspect_ratio, images, created_at')
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      setSavedGenerations(data || [])
    } catch (e) {
      console.warn('supabase fetch error', e)
    }
  }

  React.useEffect(() => { loadPage(0) }, [])

  async function handleDelete(id) {
    if (!supabase) return
    if (!confirm('Delete this generation?')) return
    try {
      const { error } = await supabase.from('generations').delete().eq('id', id)
      if (error) throw error
      // reload current page
      loadPage(page)
    } catch (e) {
      console.warn('delete error', e)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8">
      <main className="max-w-6xl mx-auto bg-neutral-900 p-4 sm:p-6 rounded-xl border border-neutral-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Saved Generations</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-sm text-neutral-400 hover:text-white">Back</button>
          </div>
        </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {savedGenerations.length === 0 ? (
            <div className="text-sm text-neutral-400 text-center py-12">No saved generations.</div>
          ) : (
            savedGenerations.map((g) => (
              <div
                key={g.id}
                className="bg-neutral-800 p-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-emerald-900 hover:-translate-y-1 flex flex-col gap-2 border border-transparent hover:border-emerald-700"
              >
                <div className="text-base text-neutral-100 font-semibold truncate mb-1" title={g.prompt}>{g.prompt}</div>
                <div className="text-xs text-neutral-400 mb-2">{g.aspect_ratio} • {new Date(g.created_at).toLocaleString()}</div>
                <div className="flex gap-2 mb-2">
                  {(g.images || []).slice(0,3).map((src, i) => (
                    <div key={i} className="flex-1">
                      <img
                        src={src}
                        alt={`gen-${g.id}-${i}`}
                        className="w-full h-20 sm:h-24 md:h-28 object-cover rounded-lg cursor-pointer border-2 border-neutral-900 hover:border-emerald-500 transition duration-150"
                        onClick={() => setPreviewSrc(src)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <button
                    onClick={() => { navigator.clipboard?.writeText(window.location.href + `#gen-${g.id}`) }}
                    className="px-3 py-1 rounded bg-neutral-900 text-xs text-neutral-300 hover:bg-emerald-700 hover:text-white transition"
                  >
                    Copy link
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="px-3 py-1 rounded bg-red-900 text-xs text-red-300 hover:bg-red-700 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/** Only show pagination when there's something to paginate **/}
        { (savedGenerations.length > 0 || page > 0) && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-neutral-400">Page {page + 1}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (page > 0) { setPage(p => { const np = p-1; loadPage(np); return np }) } }}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-emerald-700 hover:text-white transition text-sm shadow"
                disabled={page <= 0}
              >
                Prev
              </button>
              <button
                onClick={() => { setPage(p => { const np = p+1; loadPage(np); return np }) }}
                className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-emerald-700 hover:text-white transition text-sm shadow"
                disabled={savedGenerations.length < pageSize}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {previewSrc && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewSrc(null)}>
            <div className="bg-neutral-900 rounded-xl p-4 shadow-2xl border border-emerald-700 flex flex-col items-center">
              <img src={previewSrc} alt="preview" className="max-w-[80vw] max-h-[70vh] rounded-xl shadow-lg mb-2" />
              <button onClick={() => setPreviewSrc(null)} className="mt-2 px-4 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-800 transition">Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
