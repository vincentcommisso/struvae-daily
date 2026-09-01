import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import StruvaeDaily from "./App";

export default function CompanyGate() {
  const { companySlug } = useParams();
  const [status, setStatus] = useState("loading"); // loading | found | notFound
  const [company, setCompany] = useState(null);

  useEffect(() => {
    async function lookup() {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", companySlug)
        .single();

      if (error || !data) {
        setStatus("notFound");
      } else {
        setCompany(data);
        setStatus("found");
      }
    }
    lookup();
  }, [companySlug]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#565B60" }}>
        Loading…
      </div>
    );
  }

  if (status === "notFound") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>We couldn't find that company</div>
        <div style={{ color: "#565B60", fontSize: 14 }}>Double check the link your PM gave you.</div>
      </div>
    );
  }

  return <StruvaeDaily company={company} />;
}