import { RecordsPanel, type FieldSpec } from "./RecordsPanel";
import { disciplines } from "@/lib/gallery-data";
import {
  deleteAboutEntry,
  deleteMediaItem,
  deleteTrainingOffer,
  deptCollection,
  upsertAboutEntry,
  upsertMediaItem,
  upsertTrainingOffer,
  type AboutEntryRow,
  type AboutKind,
  type MediaItemRow,
  type TrainingOfferRow,
} from "@/lib/data/content";

/**
 * The Studio's content panels: what the four quiet departments can show, the
 * classes that are actually running, and the studio's record.
 *
 * Each of these used to be a code file with TODO notes in it, which meant the
 * artist couldn't add any of it without a deploy — so none of it was ever
 * added. Published is a switch on every row: write it now, show it when it's
 * true.
 */

const DEPT_OPTIONS = disciplines.map((d) => ({ value: d.id, label: d.label }));

export function DepartmentMediaPanel({ initial }: { initial: MediaItemRow[] }) {
  const fields: FieldSpec<MediaItemRow & { discipline?: string }>[] = [
    {
      key: "collection",
      label: "Department",
      type: "select",
      options: DEPT_OPTIONS.map((o) => ({ value: deptCollection(o.value), label: o.label })),
      required: true,
    },
    { key: "image_path", label: "Photo", type: "image" },
    {
      key: "youtube_url",
      label: "Video link (optional)",
      placeholder: "https://youtu.be/…",
      hint: "A YouTube link plays on the department's page. A photo or a video — either is enough.",
      half: true,
    },
    { key: "title", label: "Title", placeholder: "Opening night at the Arts Centre", half: true },
    {
      key: "caption",
      label: "Caption",
      type: "textarea",
      placeholder: "One line about what this shows.",
    },
    { key: "sort_order", label: "Order", type: "number", half: true },
    { key: "published", label: "Published", type: "checkbox", placeholder: "Show on the site", half: true },
  ];

  return (
    <RecordsPanel
      heading="Department photos & videos"
      blurb="Music, dance, sculpting and acrobatics have no archive on the site. Add photographs or YouTube links here and the department's page shows them — and it returns to the menu bar once it has something."
      addLabel="Add media"
      emptyNote="No department media yet. The four departments say honestly that their archive isn't online."
      rows={initial}
      fields={fields}
      describe={(r) => ({
        title: r.title || r.caption || "Untitled",
        detail: `${(r.collection || "").replace("dept:", "")}${r.published ? "" : " · draft"}${r.youtube_url ? " · video" : ""}`,
        image: r.image_path,
      })}
      emptyRow={() =>
        ({
          collection: deptCollection("music"),
          image_path: null,
          youtube_url: null,
          title: "",
          caption: "",
          sort_order: initial.length + 1,
          published: true,
        }) as MediaItemRow
      }
      onSave={async (row) => {
        await upsertMediaItem({
          data: {
            id: row.id,
            collection: row.collection,
            imagePath: row.image_path,
            youtubeUrl: row.youtube_url,
            title: row.title,
            caption: row.caption,
            sortOrder: row.sort_order,
            published: row.published,
          },
        });
      }}
      onDelete={async (id) => {
        await deleteMediaItem({ data: id });
      }}
    />
  );
}

export function TrainingPanel({ initial }: { initial: TrainingOfferRow[] }) {
  const fields: FieldSpec<TrainingOfferRow>[] = [
    {
      key: "discipline",
      label: "Department",
      type: "select",
      options: [
        { value: "dance", label: "Dance" },
        { value: "acrobatics", label: "Acrobatics" },
      ],
      required: true,
    },
    { key: "name", label: "What it is", placeholder: "Group class", required: true },
    { key: "level", label: "Who it's for", placeholder: "Beginners, 12 and over", half: true },
    { key: "schedule", label: "When", placeholder: "Tuesdays & Thursdays, 17:00–18:30", half: true },
    { key: "location", label: "Where", placeholder: "MillerArtz studio, Arusha", half: true },
    { key: "price", label: "Cost", placeholder: "TSh 30,000 a month", half: true },
    {
      key: "notes",
      label: "Anything else",
      type: "textarea",
      placeholder: "What to bring, how to book.",
    },
    { key: "sort_order", label: "Order", type: "number", half: true },
    { key: "published", label: "Published", type: "checkbox", placeholder: "Show on the site", half: true },
  ];

  return (
    <RecordsPanel
      heading="Training & coaching"
      blurb="Classes shown at millerartz.com/learn/training. Until there's one here, the page invites people to ask directly rather than printing a timetable that doesn't exist."
      addLabel="Add a class"
      emptyNote="No classes yet."
      rows={initial}
      fields={fields}
      describe={(r) => ({
        title: r.name,
        detail: [r.discipline, r.schedule, r.published ? "" : "draft"].filter(Boolean).join(" · "),
      })}
      emptyRow={() =>
        ({
          discipline: "dance",
          name: "",
          level: "",
          schedule: "",
          location: "",
          price: "",
          notes: "",
          sort_order: initial.length + 1,
          published: true,
        }) as TrainingOfferRow
      }
      onSave={async (row) => {
        await upsertTrainingOffer({
          data: {
            id: row.id,
            discipline: row.discipline,
            name: row.name,
            level: row.level,
            schedule: row.schedule,
            location: row.location,
            price: row.price,
            notes: row.notes,
            sortOrder: row.sort_order,
            published: row.published,
          },
        });
      }}
      onDelete={async (id) => {
        await deleteTrainingOffer({ data: id });
      }}
    />
  );
}

const KIND_OPTIONS: { value: AboutKind; label: string }[] = [
  { value: "exhibition", label: "Exhibition" },
  { value: "press", label: "Press or interview" },
  { value: "collector", label: "Collector" },
  { value: "testimonial", label: "What a client said" },
];

export function AboutRecordPanel({ initial }: { initial: AboutEntryRow[] }) {
  const fields: FieldSpec<AboutEntryRow>[] = [
    { key: "kind", label: "Kind of entry", type: "select", options: KIND_OPTIONS, required: true },
    {
      key: "title",
      label: "Title",
      placeholder: "Group show: New Voices — exhibitions and press only",
      half: true,
    },
    {
      key: "subtitle",
      label: "Venue or outlet",
      placeholder: "Alliance Française, Arusha",
      half: true,
    },
    { key: "date_text", label: "When", placeholder: "March 2026", half: true },
    { key: "url", label: "Link (optional)", placeholder: "https://…", half: true },
    {
      key: "quote",
      label: "Their words",
      type: "textarea",
      hint: "Testimonials only — exactly as the client wrote or said it, with their permission.",
    },
    { key: "name", label: "Name", placeholder: "Amina K.", half: true },
    { key: "place", label: "Place", placeholder: "Nairobi, Kenya", half: true },
    {
      key: "artwork_id",
      label: "Piece it was about",
      placeholder: "golden-mane",
      hint: "Optional. The address of the painting, as it appears after /gallery/.",
      half: true,
    },
    { key: "sort_order", label: "Order", type: "number", half: true },
    { key: "published", label: "Published", type: "checkbox", placeholder: "Show on the site", half: true },
  ];

  return (
    <RecordsPanel
      heading="Exhibitions, press & testimonials"
      blurb="The studio's record, on the About page. Each kind shows only once there's a real entry — nothing is invented, and a testimonial should be the client's own words, published with their permission."
      addLabel="Add an entry"
      emptyNote="Nothing recorded yet. The About page says features and listings are coming."
      rows={initial}
      fields={fields}
      describe={(r) => ({
        title: r.kind === "testimonial" || r.kind === "collector" ? r.name : r.title,
        detail: [
          KIND_OPTIONS.find((k) => k.value === r.kind)?.label,
          r.subtitle || r.place,
          r.date_text,
          r.published ? "" : "draft",
        ]
          .filter(Boolean)
          .join(" · "),
      })}
      emptyRow={() =>
        ({
          kind: "exhibition",
          title: "",
          subtitle: "",
          date_text: "",
          url: null,
          quote: "",
          name: "",
          place: "",
          artwork_id: null,
          sort_order: initial.length + 1,
          published: true,
        }) as AboutEntryRow
      }
      onSave={async (row) => {
        await upsertAboutEntry({
          data: {
            id: row.id,
            kind: row.kind,
            title: row.title,
            subtitle: row.subtitle,
            dateText: row.date_text,
            url: row.url,
            quote: row.quote,
            name: row.name,
            place: row.place,
            artworkId: row.artwork_id,
            sortOrder: row.sort_order,
            published: row.published,
          },
        });
      }}
      onDelete={async (id) => {
        await deleteAboutEntry({ data: id });
      }}
    />
  );
}
