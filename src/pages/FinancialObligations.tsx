import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, Edit, TrendingDown, Building2, User } from "lucide-react";
import { useFinancialObligations } from "@/hooks/useFinancialObligations";
import { AddObligationDialog } from "@/components/AddObligationDialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialObligations() {
  const { obligations, isLoading, deleteObligation } = useFinancialObligations();

  const activeObligations = obligations?.filter((o) => o.status === "active") || [];
  const totalOutstanding =
    activeObligations.reduce((sum, o) => sum + Number(o.outstanding_balance), 0) || 0;
  const investorTotal =
    activeObligations
      .filter((o) => o.obligation_type === "investor")
      .reduce((sum, o) => sum + Number(o.outstanding_balance), 0) || 0;
  const loanTotal =
    activeObligations
      .filter((o) => o.obligation_type === "bank_loan")
      .reduce((sum, o) => sum + Number(o.outstanding_balance), 0) || 0;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this financial obligation?")) {
      deleteObligation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "paid":
        return <Badge variant="secondary">Paid</Badge>;
      case "defaulted":
        return <Badge variant="destructive">Defaulted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Obligations</h1>
            <p className="text-muted-foreground">Manage investors and bank loans</p>
          </div>
          <AddObligationDialog />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                €{totalOutstanding.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{activeObligations.length} active obligations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investor Obligations</CardTitle>
              <User className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                €{investorTotal.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeObligations.filter((o) => o.obligation_type === "investor").length} investors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bank Loans</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                €{loanTotal.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeObligations.filter((o) => o.obligation_type === "bank_loan").length} loans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Obligations List */}
        <Card>
          <CardHeader>
            <CardTitle>All Financial Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : obligations && obligations.length > 0 ? (
              <div className="space-y-4">
                {obligations.map((obligation) => {
                  const isDueSoon =
                    obligation.due_date &&
                    new Date(obligation.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={obligation.id}
                      className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{obligation.creditor_name}</h3>
                            {getStatusBadge(obligation.status)}
                            {obligation.obligation_type === "investor" ? (
                              <Badge variant="outline">
                                <User className="h-3 w-3 mr-1" />
                                Investor
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Building2 className="h-3 w-3 mr-1" />
                                Bank Loan
                              </Badge>
                            )}
                            {isDueSoon && obligation.status === "active" && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Due Soon
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Principal Amount</p>
                              <p className="font-medium">
                                €{Number(obligation.principal_amount).toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Outstanding Balance</p>
                              <p className="font-medium text-destructive">
                                €{Number(obligation.outstanding_balance).toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            {obligation.interest_rate && (
                              <div>
                                <p className="text-muted-foreground">Interest Rate</p>
                                <p className="font-medium">{Number(obligation.interest_rate).toFixed(2)}%</p>
                              </div>
                            )}
                            {obligation.monthly_payment && (
                              <div>
                                <p className="text-muted-foreground">Monthly Payment</p>
                                <p className="font-medium">
                                  €{Number(obligation.monthly_payment).toLocaleString("de-DE", {
                                    minimumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Start Date: </span>
                              <span className="font-medium">{format(new Date(obligation.start_date), "PPP")}</span>
                            </div>
                            {obligation.due_date && (
                              <div>
                                <span className="text-muted-foreground">Due Date: </span>
                                <span className="font-medium">{format(new Date(obligation.due_date), "PPP")}</span>
                              </div>
                            )}
                          </div>

                          {obligation.notes && (
                            <p className="text-sm text-muted-foreground italic">{obligation.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(obligation.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No financial obligations recorded yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Add Obligation" to record investor money or bank loans.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
