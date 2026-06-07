"use client";
import { useState } from "react";
import BoundingBox from "@/components/homepage/LoginCard";
import Navigation from "@/components/homepage/Navigation";
import Tabs, {
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/homepage/Toolbar";

export default function Home() {
  const [tabValue, setTabValue] = useState("documents");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white font-sans ">
      <main className="flex flex-1  w-full max-w-7xl border-x border-neutral-50 flex-col bg-white">
        <Navigation />

        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList className="mx-4 cursor-pointer mt-4 w-fit">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
          </TabsList>
          <TabsContent value="documents">
            <BoundingBox />
          </TabsContent>
          <TabsContent value="signature" className="p-6">
            <h1 className="text-2xl font-bold">Home Page</h1>
            <p>Welcome to the homepage.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
