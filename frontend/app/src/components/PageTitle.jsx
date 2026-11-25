import { brand } from "../lib/brand.js";

// Browser tab title. React 19 moves a <title> rendered anywhere into <head>.
export default function PageTitle({ title }) {
  return <title>{`${title} · ${brand.name}`}</title>;
}
