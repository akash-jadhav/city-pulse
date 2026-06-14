import { redirect } from "next/navigation";
import { getDefaultCitySlug } from "@/config/cities/index";

export default async function Home() {
  const slug = await getDefaultCitySlug();
  redirect(`/${slug}`);
}
