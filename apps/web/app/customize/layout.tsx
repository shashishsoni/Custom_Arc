/** Full-bleed studio shell under the site header (Clean Rail). */
export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`#site-footer{display:none!important}`}</style>
      <div className="relative h-[calc(100dvh-var(--header-h))] w-full overflow-hidden">
        {children}
      </div>
    </>
  )
}
