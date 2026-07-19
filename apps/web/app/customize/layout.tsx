/** Full-bleed studio shell under the site header (Clean Rail). */
export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`#site-footer{display:none!important}`}</style>
      <div className="relative left-1/2 w-screen -translate-x-1/2 h-[calc(100dvh-var(--header-h))] overflow-hidden">
        {children}
      </div>
    </>
  )
}
