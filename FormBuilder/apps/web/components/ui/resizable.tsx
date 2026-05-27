"use client"
export function ResizablePanelGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}
export function ResizablePanel({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}
export function ResizableHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}
