import { AppProvider } from "../context/AppContext";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}
