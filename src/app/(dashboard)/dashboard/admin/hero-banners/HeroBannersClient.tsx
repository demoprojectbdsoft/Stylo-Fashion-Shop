"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Select, ListBox, Switch, Modal } from "@heroui/react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  Package,
  FolderTree,
  Store,
  Link2,
  Check,
  SlidersHorizontal,
  Megaphone,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import ImageUploader from "@/components/shared/ImageUploader";
import { addBanner, updateBanner, deleteBanner } from "@/lib/action/banners";
import type { Banner, BannerStatus, BannerType } from "@/types/banner";

interface ProductLite {
  id?: string;
  _id?: string;
  title: string;
}
interface CategoryLite {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
}
interface StoreLite {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
}

interface HeroBannersClientProps {
  initialBanners: Banner[];
  products: ProductLite[];
  categories: CategoryLite[];
  stores: StoreLite[];
}

const TYPE_OPTIONS: { value: BannerType; label: string; icon: typeof Package }[] = [
  { value: "product", label: "Product Promotion", icon: Package },
  { value: "category", label: "Category Promotion", icon: FolderTree },
  { value: "vendor", label: "Vendor Spotlight", icon: Store },
  { value: "custom", label: "Custom Promotion", icon: Link2 },
];

const STATUS_STYLE: Record<BannerStatus, string> = {
  active: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  scheduled: "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
  draft: "bg-[var(--surface-alt)] text-[var(--foreground-muted)] border-[var(--border-color)]",
  expired: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
};

const idOf = (row: { id?: string; _id?: string }) => String(row.id || row._id || "");
const typeLabel = (t: BannerType) => TYPE_OPTIONS.find((o) => o.value === t)?.label || t;

/** Draft/active/scheduled/expired, read from the switch and the dates. */
function computeStatus(isActive: boolean, start: string | null, end: string | null): BannerStatus {
  if (!isActive) return "draft";
  const now = Date.now();
  if (start && new Date(start).getTime() > now) return "scheduled";
  if (end && new Date(end).getTime() < now) return "expired";
  return "active";
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function toDisplay(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  type: "product" as BannerType,
  desktopImage: "",
  mobileImage: "",
  ctaText: "Shop Now",
  productId: "",
  categoryId: "",
  vendorId: "",
  customUrl: "",
  order: 0,
  startDate: "",
  endDate: "",
  isActive: false,
};

export default function HeroBannersClient({
  initialBanners = [],
  products = [],
  categories = [],
  stores = [],
}: HeroBannersClientProps) {
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>(banners_(initialBanners));
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | BannerType>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [preview, setPreview] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function banners_(rows: Banner[]) {
    return Array.isArray(rows) ? rows : [];
  }

  const stats = useMemo(() => {
    const active = banners.filter((b) => b.status === "active" || b.status === "scheduled").length;
    return { total: banners.length, active, draft: banners.length - active };
  }, [banners]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return banners.filter((b) => {
      const matchesType = typeFilter === "all" || b.type === typeFilter;
      const matchesQuery = !q || b.title.toLowerCase().includes(q) || b.subtitle.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [banners, searchQuery, typeFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: banners.length });
    setIsFormOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle,
      type: b.type,
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage,
      ctaText: b.ctaText || "Shop Now",
      productId: b.target.productId || "",
      categoryId: b.target.categoryId || "",
      vendorId: b.target.vendorId || "",
      customUrl: b.target.customUrl || "",
      order: b.order ?? 0,
      startDate: toLocalInput(b.startDate),
      endDate: toLocalInput(b.endDate),
      isActive: b.isActive,
    });
    setIsFormOpen(true);
  };

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Banner title is required");
    if (!form.desktopImage) return toast.error("Upload a desktop banner image");
    if (form.type === "product" && !form.productId) return toast.error("Select a product");
    if (form.type === "category" && !form.categoryId) return toast.error("Select a category");
    if (form.type === "vendor" && !form.vendorId) return toast.error("Select a vendor");
    if (form.type === "custom" && !form.customUrl.trim()) return toast.error("Enter a destination URL");

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        type: form.type,
        desktopImage: form.desktopImage,
        mobileImage: form.mobileImage,
        ctaText: form.ctaText.trim() || "Shop Now",
        order: Number(form.order) || 0,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        isActive: form.isActive,
        productId: form.type === "product" ? form.productId : undefined,
        categoryId: form.type === "category" ? form.categoryId : undefined,
        vendorId: form.type === "vendor" ? form.vendorId : undefined,
        customUrl: form.type === "custom" ? form.customUrl.trim() : undefined,
      };

      const res = editingId ? await updateBanner(editingId, payload) : await addBanner(payload);

      if (res?.success === false) {
        toast.error(res?.message || "Could not save the banner");
        return;
      }

      const saved: Banner | undefined = res?.data;
      if (saved) {
        setBanners((prev) =>
          editingId ? prev.map((b) => (b.id === editingId ? saved : b)) : [saved, ...prev]
        );
      }
      toast.success(editingId ? "Banner updated" : "Banner created");
      setIsFormOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (b: Banner, next: boolean) => {
    const res = await updateBanner(b.id, { isActive: next });
    if (res?.success === false) {
      toast.error(res?.message || "Could not update the banner");
      return;
    }
    toast.success(next ? "Banner published" : "Banner moved to drafts");
    setBanners((prev) =>
      prev.map((row) =>
        row.id === b.id ? { ...row, isActive: next, status: computeStatus(next, row.startDate, row.endDate) } : row
      )
    );
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteBanner(deleteTarget.id);
      if (res?.success === false) {
        toast.error(res?.message || "Could not delete the banner");
        return;
      }
      toast.success("Banner deleted");
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground-muted)] mb-1">
            <Link href="/dashboard/admin" className="hover:text-primary transition-colors">
              Admin Dashboard
            </Link>
            <span>/</span>
            <span className="text-primary">Hero Banners</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2.5">
            Hero Banner <span className="text-primary">Management</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--foreground-muted)] mt-1">
            The homepage hero. Upload the artwork, pick a target, schedule it, and publish.
          </p>
        </div>
        <Button
          onPress={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Banners", value: stats.total, icon: SlidersHorizontal, tone: "text-primary bg-primary/10" },
          { label: "Live / Scheduled", value: stats.active, icon: CheckCircle2, tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60" },
          { label: "Draft / Past", value: stats.draft, icon: CalendarIcon, tone: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60" },
        ].map((card) => (
          <Card key={card.label} className="p-4 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl flex items-center gap-4 shadow-2xs">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--foreground-muted)]">{card.label}</p>
              <p className="text-xl font-extrabold text-[var(--foreground)]">{card.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] z-10" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banners..."
              className="w-full pl-9 pr-4 h-10 bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl text-xs"
            />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            {(["all", "product", "category", "vendor", "custom"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  typeFilter === t ? "bg-primary text-white shadow-xs" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-alt)] text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span>View Homepage</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Megaphone className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--foreground)]">No banners yet</h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              {searchQuery || typeFilter !== "all"
                ? "Try a different search or filter."
                : "Add your first hero banner to fill the homepage."}
            </p>
          </div>
          <Button onPress={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create First Banner</span>
          </Button>
        </Card>
      ) : (
        <Card className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xs p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--surface-alt)]/80 dark:bg-[var(--surface-alt)]/40 text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  <th className="py-3.5 px-4 w-14 text-center">Order</th>
                  <th className="py-3.5 px-4">Banner</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Published</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/60 text-xs">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--surface-alt)]/70 dark:hover:bg-[var(--surface)]/30 transition-colors bg-[var(--surface-elevated)]">
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--surface-alt)] font-bold text-[var(--foreground)] font-mono text-xs">
                        {b.order}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-12 rounded-lg bg-[var(--surface-alt)] border border-[var(--border-color)] overflow-hidden shrink-0">
                          {b.desktopImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.desktopImage} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[var(--foreground-muted)]">
                              <ImageIcon className="w-5 h-5" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--foreground)] line-clamp-1">{b.title}</p>
                          <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-1">
                            {b.href ? b.href : "Target removed"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--surface-alt)] text-[11px] font-semibold text-[var(--foreground)]">
                        {typeLabel(b.type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[var(--foreground-muted)]">
                      {b.startDate || b.endDate ? `${toDisplay(b.startDate)} → ${toDisplay(b.endDate)}` : "Always on"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${STATUS_STYLE[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Switch isSelected={b.isActive} onChange={(val) => toggleActive(b, val)} className="cursor-pointer">
                        <Switch.Content className="cursor-pointer">
                          <Switch.Control className="cursor-pointer">
                            <Switch.Thumb className="cursor-pointer" />
                          </Switch.Control>
                        </Switch.Content>
                      </Switch>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button onClick={() => setPreview(b)} title="Preview" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button onClick={() => openEdit(b)} title="Edit" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                          <Edit2 className="w-[18px] h-[18px]" />
                        </button>
                        <button onClick={() => setDeleteTarget(b)} title="Delete" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer">
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit modal */}
      <Modal isOpen={isFormOpen} onOpenChange={setIsFormOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90dvh] overflow-y-auto text-[var(--foreground)]">
              <Modal.Header className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <Modal.Heading className="text-base font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {editingId ? "Edit Banner" : "Create Banner"}
                </Modal.Heading>
                <Modal.CloseTrigger className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer p-1 rounded-lg">✕</Modal.CloseTrigger>
              </Modal.Header>

              <Modal.Body>
                <form onSubmit={handleSubmit} id="banner-form" className="space-y-5">
                  {/* Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold">Banner Type <span className="text-rose-500">*</span></label>
                    <Select
                      selectedKey={form.type}
                      onSelectionChange={(key) => set({ type: String(key) as BannerType })}
                      placeholder="Choose a type"
                    >
                      <Select.Trigger className="w-full cursor-pointer bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {TYPE_OPTIONS.map((opt) => (
                            <ListBox.Item key={opt.value} id={opt.value} textValue={opt.label} className="cursor-pointer py-2">
                              <span className="flex items-center gap-2 text-xs font-medium">
                                <opt.icon className="w-3.5 h-3.5 text-primary" />
                                {opt.label}
                              </span>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  {/* Target — depends on type */}
                  {form.type !== "custom" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">
                        {form.type === "product" ? "Product" : form.type === "category" ? "Category" : "Vendor"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <Select
                        selectedKey={
                          form.type === "product" ? form.productId : form.type === "category" ? form.categoryId : form.vendorId
                        }
                        onSelectionChange={(key) => {
                          const v = String(key);
                          if (form.type === "product") set({ productId: v });
                          else if (form.type === "category") set({ categoryId: v });
                          else set({ vendorId: v });
                        }}
                        placeholder="Choose a target"
                      >
                        <Select.Trigger className="w-full cursor-pointer bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="max-h-60 overflow-y-auto">
                          <ListBox>
                            {form.type === "product" &&
                              products.map((p) => (
                                <ListBox.Item key={idOf(p)} id={idOf(p)} textValue={p.title} className="cursor-pointer py-2">
                                  <span className="text-xs font-medium truncate max-w-[320px]">{p.title}</span>
                                </ListBox.Item>
                              ))}
                            {form.type === "category" &&
                              categories.map((c) => (
                                <ListBox.Item key={idOf(c)} id={idOf(c)} textValue={c.name} className="cursor-pointer py-2">
                                  <span className="text-xs font-medium">{c.name}</span>
                                </ListBox.Item>
                              ))}
                            {form.type === "vendor" &&
                              stores.map((s) => (
                                <ListBox.Item key={idOf(s)} id={idOf(s)} textValue={s.name} className="cursor-pointer py-2">
                                  <span className="text-xs font-medium">{s.name}</span>
                                </ListBox.Item>
                              ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  )}

                  {/* Custom URL */}
                  {form.type === "custom" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold">Destination URL <span className="text-rose-500">*</span></label>
                      <Input
                        value={form.customUrl}
                        onChange={(e) => set({ customUrl: e.target.value })}
                        placeholder="https://example.com/seasonal-offer"
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl text-xs"
                      />
                    </div>
                  )}

                  {/* Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploader
                      label="Desktop Banner Image"
                      value={form.desktopImage}
                      onChange={(url) => set({ desktopImage: url })}
                      required
                      hint="Wide artwork — PNG, JPG, WEBP or GIF (animated GIFs supported)."
                    />
                    <ImageUploader
                      label="Mobile Banner Image (optional)"
                      value={form.mobileImage}
                      onChange={(url) => set({ mobileImage: url })}
                      hint="A taller or narrower crop for phones. Falls back to the desktop image."
                    />
                  </div>

                  {/* Title / Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">Banner Title <span className="text-rose-500">*</span></label>
                      <Input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Eid Mega Sale" className="w-full rounded-xl text-xs" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">Subtitle / Description</label>
                      <Input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} placeholder="e.g. Up to 40% off electronics" className="w-full rounded-xl text-xs" />
                    </div>
                  </div>

                  {/* CTA + order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">CTA Button Text</label>
                      <Input value={form.ctaText} onChange={(e) => set({ ctaText: e.target.value })} placeholder="Shop Now" className="w-full rounded-xl text-xs" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">Display Order</label>
                      <Input
                        type="number"
                        min={0}
                        value={String(form.order)}
                        onChange={(e) => set({ order: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">Start Date</label>
                      <input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) => set({ startDate: e.target.value })}
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl text-xs px-3 h-10 text-[var(--foreground)]"
                      />
                      <span className="text-[10px] text-[var(--foreground-muted)]">Leave empty to start immediately.</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold">End Date</label>
                      <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => set({ endDate: e.target.value })}
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl text-xs px-3 h-10 text-[var(--foreground)]"
                      />
                      <span className="text-[10px] text-[var(--foreground-muted)]">Leave empty to run until you stop it.</span>
                    </div>
                  </div>

                  {/* Publish */}
                  <div className="flex items-center justify-between p-3.5 bg-[var(--surface-alt)] rounded-xl border border-[var(--border-color)]/60">
                    <div>
                      <p className="text-xs font-bold">Publish on homepage</p>
                      <p className="text-[10px] text-[var(--foreground-muted)]">
                        Off saves it as a draft. A future start date shows it as scheduled.
                      </p>
                    </div>
                    <Switch isSelected={form.isActive} onChange={(val) => set({ isActive: val })} className="cursor-pointer">
                      <Switch.Content className="cursor-pointer">
                        <Switch.Control className="cursor-pointer">
                          <Switch.Thumb className="cursor-pointer" />
                        </Switch.Control>
                      </Switch.Content>
                    </Switch>
                  </div>
                </form>
              </Modal.Body>

              <Modal.Footer className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <Button variant="outline" onPress={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[var(--border-color)] text-[var(--foreground)]">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="banner-form"
                  isDisabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-gradient text-[var(--on-grad-text)] text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Preview modal */}
      <Modal isOpen={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-5 text-[var(--foreground)]">
              <Modal.Header className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <Modal.Heading className="text-base font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Banner Preview
                </Modal.Heading>
                <Modal.CloseTrigger className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer p-1 rounded-lg">✕</Modal.CloseTrigger>
              </Modal.Header>
              <Modal.Body>
                {preview && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface-alt)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview.desktopImage} alt={preview.title} className="w-full h-auto object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent flex flex-col justify-center p-6 md:p-10 max-w-xl">
                        <h3 className="text-xl md:text-3xl font-extrabold text-white drop-shadow">
                          {preview.title || "Banner title"}
                        </h3>
                        {preview.subtitle && (
                          <p className="text-xs md:text-sm text-white/90 mt-1.5">{preview.subtitle}</p>
                        )}
                        <span className="mt-4 inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold">
                          {preview.ctaText || "Shop Now"}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--foreground-muted)] space-y-1">
                      <p><span className="font-semibold text-[var(--foreground)]">Type:</span> {typeLabel(preview.type)}</p>
                      <p><span className="font-semibold text-[var(--foreground)]">Destination:</span> {preview.href || "target removed"}</p>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="flex items-center justify-end">
                <Button variant="outline" onPress={() => setPreview(null)} className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[var(--border-color)]">
                  Close
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl space-y-4 text-[var(--foreground)]">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-base font-bold">Delete this banner?</h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  &ldquo;{deleteTarget?.title}&rdquo; will be removed from the homepage immediately.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" onPress={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-[var(--border-color)]">
                  Cancel
                </Button>
                <Button onPress={confirmDelete} isDisabled={isDeleting} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
