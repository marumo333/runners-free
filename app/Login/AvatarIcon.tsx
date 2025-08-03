// components/Icon.tsx
"use client";

import React, { FC } from "react";
import Image from "next/image";

type Props = {
  url: string;
  className?: string;     
};

const Icon: FC<Props> = ({ url, className = "" }) => (
  <div className={`relative rounded-full overflow-hidden bg-gray-200 ${className}`}>
    {url ? (
      <Image
        src={url}
        alt="Avatar"
        fill
        className="object-cover"
        unoptimized
        priority
      />
    ) : (
      <div className="w-full h-full bg-gray-400" />
    )}
  </div>
);

export default Icon;

