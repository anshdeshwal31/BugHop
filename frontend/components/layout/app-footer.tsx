import Link from "next/link";
import { Bug } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-white/[0.08] mt-12 py-10 w-full relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md border border-white/[0.12] bg-[#120b0b] flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4 text-[#ef3a2d]" />
            </div>
            <div>
              <p className="font-semibold text-[#f5efe7] text-sm tracking-wide">BugHop</p>
              <p className="text-xs text-[#a28d83] mt-0.5">Autonomous code review engine</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm text-[#b49a8e]">
            <Link href="#" className="hover:text-[#ef3a2d] transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-[#ef3a2d] transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-[#ef3a2d] transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-[#ef3a2d] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#ef3a2d] transition-colors">Privacy</Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.04] text-[#a28d83] text-[10px] uppercase tracking-[0.2em] rig-mono">
          <span>Built for engineering teams</span>
          <span>© {new Date().getFullYear()} BugHop. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
