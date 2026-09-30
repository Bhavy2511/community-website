import Image from "next/image";

export default function PageHero({ eyebrow, title, copy, image, imagePosition, children }) {
  return (
    <section className="page-hero">
      {image && <Image src={image} alt="" fill priority sizes="100vw" style={imagePosition ? { objectPosition: imagePosition } : undefined} />}
      <div className="page-hero-shade" />
      <div className="page-hero-content">
        <p className="eyebrow light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        {children}
      </div>
    </section>
  );
}
