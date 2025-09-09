import { useState } from "react";
import TurbineListPage from "../pages/TurbineListPage";

type Turbine = {
  id: string;
  name: string;
  company: string;
  created: string;
  images: number;
};

export default function WrapperTurbine() {
  const [turbines, setTurbines] = useState<Turbine[]>([
    {
      id: "1",
      name: "Blade One",
      company: "GE",
      created: "2025-08-19",
      images: 2,
    },
    {
      id: "2",
      name: "Blade Two",
      company: "Siemens",
      created: "2025-08-18",
      images: 5,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");

  // --- Detail
  const [detailData, setDetailData] = useState<Turbine | null>(null);

  const filteredTurbines = turbines.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TurbineListPage
      turbines={filteredTurbines}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      showCreateModal={showCreateModal}
      detailData={detailData}
      newName={newName}
      newCompany={newCompany}
      setNewName={setNewName}
      setNewCompany={setNewCompany}
      onRowClick={(tur) => console.log("Row clicked:", tur)}
      // --- Create
      onCreateClick={() => setShowCreateModal(true)}
      onCancelCreate={() => setShowCreateModal(false)}
      onCreateSubmit={(name, company) => {
        const newTur: Turbine = {
          id: Date.now().toString(),
          name,
          company,
          created: new Date().toISOString().slice(0, 10),
          images: 0,
        };
        setTurbines([...turbines, newTur]);
        setShowCreateModal(false);
        setNewName("");
        setNewCompany("");
      }}
      // --- Detail
      onOpenDetail={(tur) => setDetailData(tur)}
      onDetailChange={(tur) => setDetailData(tur)}
      onCloseDetail={() => setDetailData(null)}
      onSaveDetail={() => {
        if (detailData) {
          setTurbines(
            turbines.map((t) =>
              t.id === detailData.id ? detailData : t
            )
          );
        }
        setDetailData(null);
      }}
      onDeleteDetail={() => {
        if (detailData) {
          setTurbines(turbines.filter((t) => t.id !== detailData.id));
        }
        setDetailData(null);
      }}
    />
  );
}
