import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'
import { Github, Mail, MapPin, Link as LinkIcon, Star, Code2, Menu } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const GITHUB_USERNAME = 'djacoo'

function useGithubData(username) {
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [p, r] = await Promise.all([
          fetch(`${BACKEND_URL}/api/github/profile?username=${username}`),
          fetch(`${BACKEND_URL}/api/github/repos?username=${username}&limit=6`),
        ])
        if (!p.ok) throw new Error('Failed to load profile')
        if (!r.ok) throw new Error('Failed to load repos')
        const profileJson = await p.json()
        const reposJson = await r.json()
        if (!cancelled) {
          setProfile(profileJson)
          setRepos(reposJson)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [username])

  return { profile, repos, loading, error }
}

function Nav({ profile }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/30 bg-white/60 dark:bg-black/40 border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#top" className="font-semibold tracking-tight text-slate-800">{profile?.name || 'Portfolio'}</a>
        <div className="hidden sm:flex items-center gap-4">
          <a href="#projects" className="text-sm text-slate-700 hover:text-slate-900">Projects</a>
          <a href={profile?.html_url} target="_blank" className="text-sm inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"><Github size={16}/> GitHub</a>
          {profile?.blog && <a href={profile.blog} target="_blank" className="text-sm inline-flex items-center gap-1 text-slate-700 hover:text-slate-900"><LinkIcon size={16}/> Website</a>}
        </div>
        <button className="sm:hidden p-2 rounded hover:bg-white/40" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
      </div>
      {open && (
        <div className="sm:hidden px-4 pb-3 space-y-2">
          <a href="#projects" className="block text-sm text-slate-700">Projects</a>
          <a href={profile?.html_url} target="_blank" className="block text-sm text-slate-700">GitHub</a>
          {profile?.blog && <a href={profile.blog} target="_blank" className="block text-sm text-slate-700">Website</a>}
        </div>
      )}
    </div>
  )
}

function Hero({ profile }) {
  return (
    <section id="top" className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white/70 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-center">
        <div className="max-w-xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight text-slate-900">
            {profile?.name || 'Developer Portfolio'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 text-slate-700 text-base sm:text-lg">
            {profile?.bio || 'Building playful, modern experiences with code.'}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 flex flex-wrap items-center gap-3">
            <a href={profile?.html_url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">
              <Github size={18}/> <span>GitHub</span>
            </a>
            {profile?.blog && (
              <a href={profile.blog} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/80 hover:bg-white border border-slate-200">
                <LinkIcon size={18}/> <span>Website</span>
              </a>
            )}
            {profile?.location && (
              <span className="inline-flex items-center gap-1 text-slate-600"><MapPin size={16}/> {profile.location}</span>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function RepoCard({ repo }) {
  return (
    <a href={repo.html_url} target="_blank" className="group block rounded-xl border border-slate-200 bg-white hover:shadow-lg transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-950">{repo.name}</h3>
          <span className="inline-flex items-center gap-1 text-amber-600 text-sm"><Star size={16}/> {repo.stargazers_count}</span>
        </div>
        {repo.description && <p className="mt-2 text-sm text-slate-600">{repo.description}</p>}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          {repo.language && <span className="inline-flex items-center gap-1"><Code2 size={14}/> {repo.language}</span>}
          {repo.homepage && <span className="inline-flex items-center gap-1"><LinkIcon size={14}/> Live</span>}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {repo.topics.slice(0, 3).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

function Projects({ repos }) {
  if (!repos?.length) return null
  return (
    <section id="projects" className="relative py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Highlighted Projects</h2>
          <a href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`} target="_blank" className="text-sm text-slate-600 hover:text-slate-900">View all</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((r) => <RepoCard key={r.full_name} repo={r} />)}
        </div>
      </div>
    </section>
  )
}

function Footer({ profile }) {
  return (
    <footer className="py-10 border-t border-slate-200 bg-white/80">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <div>© {new Date().getFullYear()} {profile?.name || 'Portfolio'}</div>
        <div className="flex items-center gap-4">
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" className="inline-flex items-center gap-1 hover:text-slate-900"><Github size={16}/> GitHub</a>
          {profile?.blog && <a href={profile.blog} target="_blank" className="inline-flex items-center gap-1 hover:text-slate-900"><LinkIcon size={16}/> Website</a>}
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const { profile, repos, loading, error } = useGithubData(GITHUB_USERNAME)

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-sky-50 text-slate-900">
      <Nav profile={profile} />
      <Hero profile={profile} />
      <main>
        <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Followers</div>
              <div className="text-2xl font-semibold">{profile?.followers ?? '—'}</div>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Public Repos</div>
              <div className="text-2xl font-semibold">{profile?.public_repos ?? '—'}</div>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200 p-4">
              <div className="text-xs uppercase text-slate-500">Following</div>
              <div className="text-2xl font-semibold">{profile?.following ?? '—'}</div>
            </div>
          </div>
        </section>
        <Projects repos={repos} />
      </main>
      <Footer profile={profile} />
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[60]">
          <div className="animate-pulse text-slate-700">Loading portfolio…</div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow">{error}</div>
      )}
    </div>
  )
}
