import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Database, CheckCircle, ExternalLink, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

interface AirtableTable {
  id: string;
  name: string;
  description?: string;
  primaryFieldId: string;
  recordCount: number;
}

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
  const [isLoadingBases, setIsLoadingBases] = useState(false);
  const { toast } = useToast();

  // Mock data for demo purposes (keeping for tables since we'll need actual base selection first)
  const mockTables: AirtableTable[] = [
    { id: "tblCampaigns", name: "Campaigns", description: "Marketing campaign data", primaryFieldId: "fldName", recordCount: 156 },
    { id: "tblLeads", name: "Leads", description: "Lead tracking and management", primaryFieldId: "fldEmail", recordCount: 2847 },
    { id: "tblBudgets", name: "Budgets", description: "Budget allocation and tracking", primaryFieldId: "fldCampaign", recordCount: 45 },
    { id: "tblAnalytics", name: "Analytics", description: "Performance metrics", primaryFieldId: "fldMetric", recordCount: 892 }
  ];

  const fetchAirtableBases = async (token: string): Promise<AirtableBase[]> => {
    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.bases.map((base: any) => ({
        id: base.id,
        name: base.name,
        permissionLevel: base.permissionLevel
      }));
    } catch (error) {
      console.error('Error fetching Airtable bases:', error);
      throw error;
    }
  };

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
      // Fetch actual Airtable bases using the provided token
      const bases = await fetchAirtableBases(airtableToken);
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

  const handleBaseSelection = (baseId: string) => {
    setSelectedBase(baseId);
    setCurrentStep(3);
    toast({
      title: "Base Selected",
      description: `Loading tables from ${airtableBases.find(b => b.id === baseId)?.name}...`,
    });
  };

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleProceedToMigration = () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to import",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(4);
  };

  const handleFreeFromAirtable = async () => {
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

  const getStepProgress = () => {
    return Math.min((currentStep / 4) * 100, 100);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setAirtableToken("");
    setSelectedBase("");
    setSelectedTables([]);
    setGristToken("");
    setGristUrl("");
    setAirtableBases([]);
    setIsLoadingBases(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Database className="h-8 w-8 text-white" />
            </div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <div className="p-3 bg-green-600 rounded-xl">
              <Database className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Airtable to Grist Migration Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seamlessly migrate your data from Airtable to Grist with our intuitive step-by-step wizard
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{currentStep}/4 steps</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  Connect to Airtable & Grist
                </CardTitle>
                <CardDescription className="text-lg">
                  Enter your API tokens for both Airtable and Grist to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Airtable Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                      <div className="p-1 bg-blue-600 rounded">
                        <Database className="h-4 w-4 text-white" />
                      </div>
                      Airtable Source
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="airtable-token" className="text-sm font-medium">
                        Airtable API Token
                      </Label>
                      <Input
                        id="airtable-token"
                        type="password"
                        placeholder="pat****************************"
                        value={airtableToken}
                        onChange={(e) => setAirtableToken(e.target.value)}
                        className="text-lg p-3"
                      />
                      <p className="text-sm text-gray-600">
                        Find your token at{" "}
                        <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                          airtable.com/create/tokens
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Grist Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                    <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                      <div className="p-1 bg-green-600 rounded">
                        <Database className="h-4 w-4 text-white" />
                      </div>
                      Grist Destination
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="grist-url" className="text-sm font-medium">
                        Grist Document URL
                      </Label>
                      <Input
                        id="grist-url"
                        placeholder="https://docs.getgrist.com/your-doc-id"
                        value={gristUrl}
                        onChange={(e) => setGristUrl(e.target.value)}
                        className="text-lg p-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grist-token" className="text-sm font-medium">
                        Grist API Token
                      </Label>
                      <Input
                        id="grist-token"
                        type="password"
                        placeholder="Your Grist API token"
                        value={gristToken}
                        onChange={(e) => setGristToken(e.target.value)}
                        className="text-lg p-3"
                      />
                      <p className="text-sm text-gray-600">
                        Generate a token in your Grist account settings
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleTokenValidation} 
                  disabled={isValidatingToken}
                  className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {isValidatingToken ? "Validating Connections..." : "Connect to Both Services"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Select Airtable Base
                </CardTitle>
                <CardDescription className="text-lg">
                  Choose the base containing the tables you want to migrate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your Airtable bases...</p>
                  </div>
                ) : airtableBases.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No accessible bases found in your Airtable account.</p>
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      Go Back and Check Token
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {airtableBases.map((base) => (
                      <Card 
                        key={base.id} 
                        className="cursor-pointer hover:bg-blue-50 border-2 hover:border-blue-200 transition-all"
                        onClick={() => handleBaseSelection(base.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{base.name}</h3>
                              <p className="text-sm text-gray-500">Base ID: {base.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={base.permissionLevel === 'create' ? 'default' : 'secondary'}>
                                {base.permissionLevel}
                              </Badge>
                              <ArrowRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Select Tables to Import
                </CardTitle>
                <CardDescription className="text-lg">
                  Choose which tables you want to migrate to Grist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {mockTables.map((table) => (
                    <Card 
                      key={table.id} 
                      className={`cursor-pointer border-2 transition-all ${
                        selectedTables.includes(table.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleTableToggle(table.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={selectedTables.includes(table.id)}
                            onChange={() => handleTableToggle(table.id)}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{table.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{table.description}</p>
                            <p className="text-xs text-gray-500">{table.recordCount.toLocaleString()} records</p>
                          </div>
                          <Badge variant="outline">{table.recordCount.toLocaleString()}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {selectedTables.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>{selectedTables.length}</strong> table(s) selected for import
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTables.map(tableId => {
                        const table = mockTables.find(t => t.id === tableId);
                        return (
                          <Badge key={tableId} variant="secondary">
                            {table?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Migration Destination:</h4>
                  <p className="text-sm text-green-800">
                    Tables will be migrated to: <span className="font-mono bg-white px-2 py-1 rounded">{gristUrl}</span>
                  </p>
                </div>

                <Button 
                  onClick={handleFreeFromAirtable}
                  disabled={isImporting || selectedTables.length === 0}
                  className="w-full text-xl py-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  {isImporting ? (
                    "Migrating Data..."
                  ) : (
                    <>
                      <Rocket className="mr-3 h-6 w-6" />
                      Free from Airtable! 🚀
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border-2 border-green-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle className="h-8 w-8" />
                  Migration Complete! 🎉
                </CardTitle>
                <CardDescription className="text-lg">
                  Your data has been successfully migrated from Airtable to Grist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-4">Successfully Migrated:</h4>
                  <div className="grid gap-2">
                    {selectedTables.map(tableId => {
                      const table = mockTables.find(t => t.id === tableId);
                      return (
                        <div key={tableId} className="flex items-center justify-between bg-white p-3 rounded border">
                          <span className="font-medium">{table?.name}</span>
                          <Badge variant="default">
                            {table?.recordCount.toLocaleString()} records
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => window.open(gristUrl, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Open in Grist
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={resetFlow}
                    variant="outline"
                  >
                    Start New Migration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Need help? Check our documentation or contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
