import { Loader2 } from 'lucide-react'

export default function Loader({ fullScreen = false, text = "Yuklanmoqda..." }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">{text}</p>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 size={32} className="animate-spin text-blue-500 mb-2" />
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  )
}
