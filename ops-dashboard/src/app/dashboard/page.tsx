import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "./DashboardLayout";
import StatusBadge from "./StatusBadge";
import AlexMonitor from "./AlexMonitor";
import TaskMap from "./TaskMap";
import PipelineHealth from "./PipelineHealth";
import SecurityDashboard from "./SecurityDashboard";
import SyntheticGallery from "./SyntheticGallery";
import CompanyMap from "./CompanyMap";
import OperationalDocs from "./OperationalDocs";
import GeminiTracker from "./GeminiTracker";
import AlexChat from "./AlexChat";
import SquadBrain from "./SquadBrain";
import AutoTraffic from "./AutoTraffic";
import HackerversoIntegration from "./HackerversoIntegration";
import ResearchHub from "./ResearchHub";
import OfertasHub from "./ofertas";
import IGamingReport from "./IGamingReport";
import UnifiedOpsBoard from "./UnifiedOpsBoard";
import CopyGenerator from "../copy-generator/page";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const currentTab = (params?.tab as string) || "overview";

  const supabase = await createClient();
  await supabase.auth.getUser();

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ gridColumn: 'span 2' }}><AlexMonitor /></div>
            <div style={{ gridColumn: 'span 1' }}><StatusBadge /></div>
            <div style={{ gridColumn: 'span 3' }}><TaskMap /></div>
            <div style={{ gridColumn: 'span 2' }}><PipelineHealth /></div>
            <div style={{ gridColumn: 'span 1' }}><SecurityDashboard /></div>
          </div>
        );

      case 'mentes':
        return <SyntheticGallery />;

      case 'company-map':
        return <CompanyMap />;

      case 'squad':
        return <SquadBrain />;

      case 'traffic':
        return <AutoTraffic />;

      case 'hackerverso':
        return <HackerversoIntegration />;

      case 'research':
        return <ResearchHub />;

      case 'operacional':
        return <OperationalDocs />;

      case 'financeiro':
        return <GeminiTracker />;

      case 'chat':
        return <AlexChat />;

      case 'security':
        return <SecurityDashboard />;

      case 'ops-kanban':
        return <UnifiedOpsBoard />;

      case 'ofertas':
        return <OfertasHub />;

      case 'research-hub':
        return <ResearchHub />;

      case 'igaming':
        return <IGamingReport />;

      case 'copy-generator':
        return <CopyGenerator />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout currentTab={currentTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
