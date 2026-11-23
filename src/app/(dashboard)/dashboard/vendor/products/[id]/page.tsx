import { redirect } from "next/navigation";
import { getRequiredRole } from "@/lib/core/session";

export const dynamic = "force-dynamic";

interface EditVendorProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVendorProductPage({ params }: EditVendorProductPageProps) {
  await getRequiredRole("vendor");
  const { id } = await params;
  redirect(`/dashboard/vendor/products?edit=${id}`);
}
