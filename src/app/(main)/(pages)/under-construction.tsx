import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function UnderConstruction() {
  return (
    <BackgroundBeamsWithCollision className="flex flex-col justify-center items-center gap-4">
      <Image
        src={"/developing.png"}
        width={100}
        height={100}
        alt="under development"
      ></Image>
      <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
        Page Under Development
      </h2>
      <div className="relative mx-auto inline-block w-max  [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
        <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
          <span className="text-3xl">
            We're working hard to bring you something amazing. Please check back
            soon!
          </span>
        </div>
      </div>
      <Button className="">
        <Link className="text-purple-700" href="/">
          Go back to main page
        </Link>
      </Button>
    </BackgroundBeamsWithCollision>
  );
}
