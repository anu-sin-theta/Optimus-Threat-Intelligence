
"use client"

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-4 text-center text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Optimus Threat Intelligence. All rights reserved.</p>
    </footer>
  );
}
