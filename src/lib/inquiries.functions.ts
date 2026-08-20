import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  createInquiry,
  deleteInquiry,
  listInquiries,
  setInquiryStatus,
} from "@/db/inquiries.server";
import { requireRole } from "@/lib/auth.server";

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(160),
        phone: z
          .string()
          .trim()
          .min(7, "Geçerli bir telefon numarası girin.")
          .max(32)
          .regex(/^[0-9+()\s-]+$/, "Telefon yalnızca rakam ve + ( ) - içerebilir."),
        message: z.string().trim().max(1000).optional(),
        source: z.string().trim().max(60).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => createInquiry(data));

export const adminListInquiries = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return { items: await listInquiries() };
});

export const adminSetInquiryStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "MATCHED", "CLOSED", "SPAM"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return setInquiryStatus({ adminUserId: admin.id, ...data });
  });

export const adminDeleteInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    return deleteInquiry({ adminUserId: admin.id, ...data });
  });
