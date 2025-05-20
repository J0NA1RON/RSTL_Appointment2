import AdminOnlyServerLayout from "@/components/layout/AdminOnlyServerLayout";

export default function Layout({ children }) {
  return <AdminOnlyServerLayout>{children}</AdminOnlyServerLayout>;
}