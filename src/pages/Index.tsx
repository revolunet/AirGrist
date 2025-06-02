import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  createAirtableService, 
  type AirtableBase, 
  type AirtableTable 
} from "@/lib/airtable";
import {
  MigrationHeader,
  MigrationProgress,
  ConnectionStep,
  BaseSelectionStep,
  TableSelectionStep,
  CompletionStep,
  MigrationFooter,
} from "@/components/migration";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [airtableToken, setAirtableToken] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [gristToken, setGristToken] = useState("");
  const [gristUrl, setGristUrl] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [airtableBases, setAirtableBases] = useState<AirtableBase[]>([]);
  const [airtableTables, setAirtableTables] = useState<AirtableTable[]>([]);
  const [isLoadingBases, setIsLoadingBases] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const { toast } = useToast();

  const handleTokenValidation = async () => {
    if (!airtableToken.trim()) {
      toast({
        title: "Airtable Token Required",
        description: "Please enter your Airtable API token",
        variant: "destructive"
      });
      return;
    }

    if (!gristToken.trim() || !gristUrl.trim()) {
      toast({
        title: "Grist Details Required",
        description: "Please provide both Grist token and URL",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingToken(true);
    setIsLoadingBases(true);
    
    try {
      const airtableService = createAirtableService(airtableToken);
      const bases = await airtableService.getBases();
      setAirtableBases(bases);
      
      setIsValidatingToken(false);
      setIsLoadingBases(false);
      setCurrentStep(2);
      
      toast({
        title: "Connection Successful",
        description: `Found ${bases.length} accessible base(s) in your Airtable account`,
      });
    } catch (error) {
      setIsValidatingToken(false);
      setIsLoadingBases(false);
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Airtable. Please check your token and try again.",
        variant: "destructive"
      });
    }
  };

  const handleBaseSelection = async (baseId: string) => {
    setSelectedBase(baseId);
    setIsLoadingTables(true);
    
    try {
      const airtableService = createAirtableService(airtableToken);
      const tables = await airtableService.getTables(baseId);
      setAirtableTables(tables);
      setIsLoadingTables(false);
      setCurrentStep(3);
      
      toast({
        title: "Base Selected",
        description: `Loaded ${tables.length} table(s) from ${airtableBases.find(b => b.id === baseId)?.name}`,
      });
    } catch (error) {
      setIsLoadingTables(false);
      
      toast({
        title: "Failed to Load Tables",
        description: "Failed to fetch tables from the selected base. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleStartMigration = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to import",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsImporting(false);
    setCurrentStep(4);
    toast({
      title: "Migration Complete! 🎉",
      description: `Successfully imported ${selectedTables.length} tables to Grist`,
    });
  };

  const handleOpenGrist = () => {
    window.open(gristUrl, '_blank');
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setAirtableToken("");
    setSelectedBase("");
    setSelectedTables([]);
    setGristToken("");
    setGristUrl("");
    setAirtableBases([]);
    setAirtableTables([]);
    setIsLoadingBases(false);
    setIsLoadingTables(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <MigrationHeader />
        
        <MigrationProgress 
          currentStep={currentStep} 
          totalSteps={4} 
        />

        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <ConnectionStep
              airtableToken={airtableToken}
              setAirtableToken={setAirtableToken}
              gristToken={gristToken}
              setGristToken={setGristToken}
              gristUrl={gristUrl}
              setGristUrl={setGristUrl}
              isValidatingToken={isValidatingToken}
              onConnect={handleTokenValidation}
            />
          )}

          {currentStep === 2 && (
            <BaseSelectionStep
              airtableBases={airtableBases}
              isLoadingBases={isLoadingBases}
              isLoadingTables={isLoadingTables}
              onBaseSelect={handleBaseSelection}
              onGoBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <TableSelectionStep
              airtableTables={airtableTables}
              selectedTables={selectedTables}
              isLoadingTables={isLoadingTables}
              isImporting={isImporting}
              gristUrl={gristUrl}
              onTableToggle={handleTableToggle}
              onStartMigration={handleStartMigration}
              onGoBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <CompletionStep
              selectedTables={selectedTables}
              airtableTables={airtableTables}
              gristUrl={gristUrl}
              onOpenGrist={handleOpenGrist}
              onRestart={handleRestart}
            />
          )}
        </div>

        <MigrationFooter />
      </div>
    </div>
  );
};

export default Index;
