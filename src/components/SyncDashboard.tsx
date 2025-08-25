/**
 * MYCIVITANOVA - DASHBOARD SINCRONIZZAZIONE
 * 
 * Componente dashboard per monitorare lo stato della sincronizzazione
 * in tempo reale tra Firebase e Supabase.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Users, 
  Database, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useSyncContext } from './FirebaseSupabaseSyncProvider';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Interfaccia per le props del componente
export interface SyncDashboardProps {
  className?: string;
  showAdvanced?: boolean;
  compact?: boolean;
}

/**
 * Componente principale della dashboard
 */
export function SyncDashboard({ 
  className = '',
  showAdvanced = false,
  compact = false 
}: SyncDashboardProps) {
  const {
    syncState,
    stats,
    isInitialized,
    realtimeSync,
    syncCurrentUser,
    syncAllUsers,
    refreshStats,
    clearError,
    forceSyncCurrentUser,
    toggleRealtimeSync
  } = useSyncContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(!compact);

  /**
   * Gestisce il refresh delle statistiche
   */
  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Gestisce la sincronizzazione forzata
   */
  const handleForceSync = async () => {
    try {
      await forceSyncCurrentUser();
    } catch (error) {
      console.error('Errore sincronizzazione forzata:', error);
    }
  };

  /**
   * Gestisce la sincronizzazione di tutti gli utenti
   */
  const handleSyncAll = async () => {
    try {
      await syncAllUsers();
    } catch (error) {
      console.error('Errore sincronizzazione completa:', error);
    }
  };

  /**
   * Ottiene il colore del badge di stato
   */
  const getStatusColor = () => {
    if (syncState.error) return 'destructive';
    if (syncState.isLoading || realtimeSync.isProcessing) return 'secondary';
    if (isInitialized && realtimeSync.isInitialized) return 'default';
    return 'outline';
  };

  /**
   * Ottiene il testo dello stato
   */
  const getStatusText = () => {
    if (syncState.error) return 'Errore';
    if (syncState.isLoading || realtimeSync.isProcessing) return 'Sincronizzazione...';
    if (isInitialized && realtimeSync.isInitialized) return 'Attivo';
    return 'Inattivo';
  };

  if (compact) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <CardTitle className="text-sm">Sincronizzazione</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor()} className="text-xs">
                {getStatusText()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showDetails && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Tempo reale:</span>
                <Switch
                  checked={realtimeSync.isEnabled}
                  onCheckedChange={toggleRealtimeSync}
                  size="sm"
                />
              </div>
              
              {stats && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Utenti:</span>
                    <span className="ml-1 font-medium">{stats.totalUsers}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sincronizzati:</span>
                    <span className="ml-1 font-medium">{stats.syncedUsers}</span>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceSync}
                  disabled={syncState.isLoading}
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshStats}
                  disabled={isRefreshing}
                  className="flex-1 text-xs"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  Stats
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con stato generale */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Dashboard Sincronizzazione</span>
              </CardTitle>
              <CardDescription>
                Monitoraggio sincronizzazione Firebase ↔ Supabase
              </CardDescription>
            </div>
            <Badge variant={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stato sincronizzazione */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Stato Sistema</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Inizializzato: {isInitialized ? '✅' : '❌'}</div>
                <div>Tempo reale: {realtimeSync.isInitialized ? '✅' : '❌'}</div>
                <div>Listener attivi: {realtimeSync.activeListeners}</div>
              </div>
            </div>
            
            {/* Statistiche utenti */}
            {stats && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Utenti</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Totali: {stats.totalUsers}</div>
                  <div>Sincronizzati: {stats.syncedUsers}</div>
                  <div>Pendenti: {stats.pendingUsers}</div>
                </div>
                {stats.totalUsers > 0 && (
                  <Progress 
                    value={(stats.syncedUsers / stats.totalUsers) * 100} 
                    className="h-2"
                  />
                )}
              </div>
            )}
            
            {/* Ultima sincronizzazione */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Ultima Sync</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {syncState.lastSyncTime ? (
                  formatDistanceToNow(syncState.lastSyncTime, {
                    addSuffix: true,
                    locale: it
                  })
                ) : (
                  'Mai eseguita'
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Controlli sincronizzazione tempo reale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Sincronizzazione Tempo Reale</span>
          </CardTitle>
          <CardDescription>
            Configurazione e stato dei trigger automatici
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Abilita sincronizzazione automatica</div>
                <div className="text-sm text-muted-foreground">
                  Sincronizza automaticamente i cambiamenti in tempo reale
                </div>
              </div>
              <Switch
                checked={realtimeSync.isEnabled}
                onCheckedChange={toggleRealtimeSync}
              />
            </div>
            
            {realtimeSync.isEnabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {realtimeSync.activeListeners}
                    </div>
                    <div className="text-xs text-muted-foreground">Listener Attivi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {realtimeSync.queueSize}
                    </div>
                    <div className="text-xs text-muted-foreground">Coda Sync</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {realtimeSync.isProcessing ? '🔄' : '✅'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {realtimeSync.isProcessing ? 'Processando' : 'Inattivo'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Azioni e controlli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Azioni</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={handleForceSync}
              disabled={syncState.isLoading}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncState.isLoading ? 'animate-spin' : ''}`} />
              Sincronizza Utente
            </Button>
            
            <Button
              onClick={handleSyncAll}
              disabled={syncState.isLoading}
              variant="outline"
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Sincronizza Tutti
            </Button>
            
            <Button
              onClick={handleRefreshStats}
              disabled={isRefreshing}
              variant="outline"
              className="w-full"
            >
              <Activity className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Aggiorna Stats
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Errori */}
      {syncState.error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Errore</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-destructive">{syncState.error}</p>
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
              >
                Cancella Errore
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Statistiche avanzate */}
      {showAdvanced && stats && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiche Dettagliate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Sincronizzazioni</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div>Totali: {stats.totalSyncs}</div>
                  <div>Riuscite: {stats.successfulSyncs}</div>
                  <div>Fallite: {stats.failedSyncs}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Ultima Attività</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div>Ultimo aggiornamento: {stats.lastUpdated ? formatDistanceToNow(stats.lastUpdated, { addSuffix: true, locale: it }) : 'Mai'}</div>
                  <div>Versione schema: {stats.schemaVersion || 'N/A'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SyncDashboard;