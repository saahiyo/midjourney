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
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <main className="max-w-6xl mx-auto bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Saved Generations</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-sm text-neutral-400 hover:text-white">Back</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {savedGenerations.length === 0 ? (
            <div className="text-sm text-neutral-400">No saved generations.</div>
          ) : (
            savedGenerations.map((g) => (
              <div key={g.id} className="bg-neutral-800 p-3 rounded">
                <div className="text-sm text-neutral-200 font-medium truncate">{g.prompt}</div>
                <div className="text-xs text-neutral-400">{g.aspect_ratio} • {new Date(g.created_at).toLocaleString()}</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(g.images || []).slice(0,3).map((src, i) => (
                    <img key={i} src={src} alt={`gen-${g.id}-${i}`} className="w-full h-20 object-cover rounded cursor-pointer" onClick={() => setPreviewSrc(src)} />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => { navigator.clipboard?.writeText(window.location.href + `#gen-${g.id}`) }} className="text-xs text-neutral-400 hover:text-white">Copy link</button>
                  <button onClick={() => handleDelete(g.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-400">Page {page + 1}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (page > 0) { setPage(p => { const np = p-1; loadPage(np); return np }) } }} className="px-3 py-1 bg-neutral-800 rounded text-sm">Prev</button>
            <button onClick={() => { setPage(p => { const np = p+1; loadPage(np); return np }) }} className="px-3 py-1 bg-neutral-800 rounded text-sm">Next</button>
          </div>
        </div>

        {previewSrc && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreviewSrc(null)}>
            <img src={previewSrc} alt="preview" className="max-w-[90%] max-h-[90%] rounded shadow-lg" />
          </div>
        )}
      </main>
    </div>
  )
}
