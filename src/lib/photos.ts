"use client";

import { get, set, del, createStore } from "idb-keyval";

// Las fotos de progreso se guardan solo en este teléfono (IndexedDB), nunca en internet.
const store = typeof indexedDB !== "undefined" ? createStore("journey-photos", "photos") : undefined;

export async function savePhoto(id: string, file: Blob) {
  const resized = await resize(file, 1080);
  await set(id, resized, store);
}

export async function loadPhoto(id: string): Promise<string | null> {
  const blob = (await get(id, store)) as Blob | undefined;
  return blob ? URL.createObjectURL(blob) : null;
}

export async function loadPhotoBlob(id: string): Promise<Blob | undefined> {
  return (await get(id, store)) as Blob | undefined;
}

export async function deletePhoto(id: string) {
  await del(id, store);
}

async function resize(file: Blob, max: number): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", 0.85));
  } catch {
    return file;
  }
}
