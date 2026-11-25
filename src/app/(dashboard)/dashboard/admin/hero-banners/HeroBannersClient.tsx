"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Switch, Modal } from "@heroui/react";
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
  SlidersHorizontal,
  Megaphone,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { updateBanner, deleteBanner } from "@/lib/action/banners";
import { normalizeImageUrl } from "@/lib/imageUrl";
import type { Banner, BannerStatus, BannerType } from "@/types/banner";

interface HeroBannersClientProps {
  initialBanners: Banner[];
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

const typeLabel = (t: BannerType) => TYPE_OPTIONS.find((o) => o.value === t)?.label || t;

/** Draft/active/scheduled/expired, read from the switch and the dates. */
function computeStatus(isActive: boolean, start: string | null, end: string | null): BannerStatus {
  if (!isActive) return "draft";
  const now = Date.now();
  if (start && new Date(start).getTime() > now) return "scheduled";
  if (end && new Date(end).getTime() < now) return "expired";
  return "active";
}

function toDisplay(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function HeroBannersClient({
  initialBanners = [],
}: HeroBannersClientProps) {
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>(Array.isArray(initialBanners) ? initialBanners : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | BannerType>("all");

  const [preview, setPreview] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <Link
          href="/dashboard/admin/hero-banners/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </Link>
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
          <Link
            href="/dashboard/admin/hero-banners/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm cursor-pointer mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Banner</span>
          </Link>
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
                            <img src={normalizeImageUrl(b.desktopImage)} alt={b.title} className="w-full h-full object-cover" />
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
                        <Link
                          href={`/dashboard/admin/hero-banners/${b.id}/edit`}
                          title="Edit"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-[18px] h-[18px]" />
                        </Link>
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
                      <img src={normalizeImageUrl(preview.desktopImage)} alt={preview.title} className="w-full h-auto object-cover" />
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
