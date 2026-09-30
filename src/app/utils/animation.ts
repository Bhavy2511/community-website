import gsap from "gsap"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const animatePageIn = () => {
    const bannerOne = document.getElementById("banner-1")
    const bannerTwo = document.getElementById("banner-2")

    if (bannerOne && bannerTwo) {
        const tl = gsap.timeline()

        tl.fromTo(bannerOne, {
            xPercent: 0,
        }, {
            xPercent: -100,
            duration: 1,
            ease: "power2.inOut",
        }, 0);

        tl.fromTo(bannerTwo, {
            xPercent: 0,
        }, {
            xPercent: 100,
            duration: 1,
            ease: "power2.inOut",
        }, 0);
    }
}

export const animatePageOut = (href: string, router: AppRouterInstance) => {
    const bannerOne = document.getElementById("banner-1")
    const bannerTwo = document.getElementById("banner-2")


    if (bannerOne && bannerTwo) {
        const tl = gsap.timeline()

        tl.fromTo(bannerOne, {
            xPercent: -100,
        }, {
            xPercent: 0,
            duration: 1,
            ease: "power2.inOut",
        }, 0);

        tl.fromTo(bannerTwo, {
            xPercent: 100,
        }, {
            xPercent: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                router.push(href);
            },
        }, 0);
    }
}