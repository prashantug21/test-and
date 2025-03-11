
'use client';
import { Button } from "antd";
import styles from "./page.module.css";
import { useState } from "react";
import ModalWrapper from './component/modalWrapper'

export default function Home() {
  const [open, setOpen] = useState(false);
  return (<>
    <Button onClick={() => setOpen(true)}>Open Modal</Button>
    {open && <ModalWrapper open={open} setOpen={setOpen} />}
  </>)
}
