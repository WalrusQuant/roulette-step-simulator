'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BettingStrategy } from '@/app/lib/types';
import { PRELOADED_STRATEGIES, createBlankStrategy } from '@/app/lib/preloadedStrategies';
import {
  getUserStrategies,
  saveStrategy,
  deleteStrategy,
  duplicateStrategy,
} from '@/app/lib/storage';
import { Button } from '@/app/components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/Card';
import { StrategyCard } from '@/app/components/StrategyCard';
import { StrategyBuilder } from '@/app/components/StrategyBuilder';
import { Modal, ConfirmModal } from '@/app/components/Modal';
import { Input } from '@/app/components/Input';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { downloadJson, readJsonFile } from '@/app/lib/utils';

export default function StrategiesPage() {
  const router = useRouter();
  const [userStrategies, setUserStrategies] = useState<BettingStrategy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'preloaded' | 'custom'>('all');
  const [editingStrategy, setEditingStrategy] = useState<BettingStrategy | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<BettingStrategy | null>(null);

  useEffect(() => {
    setUserStrategies(getUserStrategies());
  }, []);

  const allStrategies = [
    ...PRELOADED_STRATEGIES,
    ...userStrategies,
  ];

  const filteredStrategies = allStrategies.filter((strategy) => {
    const matchesSearch =
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'preloaded' && strategy.isPreloaded) ||
      (filter === 'custom' && !strategy.isPreloaded);

    return matchesSearch && matchesFilter;
  });

  const handleCreateNew = () => {
    const newStrategy = createBlankStrategy();
    setEditingStrategy(newStrategy);
    setShowEditor(true);
  };

  const handleEdit = (strategy: BettingStrategy) => {
    setEditingStrategy(strategy);
    setShowEditor(true);
  };

  const handleSave = (strategy: BettingStrategy) => {
    const success = saveStrategy(strategy);
    if (success) {
      toast.success('Strategy saved!');
      setUserStrategies(getUserStrategies());
      setShowEditor(false);
      setEditingStrategy(null);
    } else {
      toast.error('Failed to save strategy');
    }
  };

  const handleDelete = (strategy: BettingStrategy) => {
    setDeleteConfirm(strategy);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      const success = deleteStrategy(deleteConfirm.id);
      if (success) {
        toast.success('Strategy deleted');
        setUserStrategies(getUserStrategies());
      } else {
        toast.error('Failed to delete strategy');
      }
      setDeleteConfirm(null);
    }
  };

  const handleDuplicate = (strategy: BettingStrategy) => {
    const newStrategy = duplicateStrategy(strategy.id);
    if (newStrategy) {
      toast.success('Strategy duplicated!');
      setUserStrategies(getUserStrategies());
    } else {
      toast.error('Failed to duplicate strategy');
    }
  };

  const handleRun = (strategy: BettingStrategy) => {
    router.push(`/simulator?strategy=${strategy.id}`);
  };

  const handleExport = (strategy: BettingStrategy) => {
    const exportData = {
      ...strategy,
      exportedAt: Date.now(),
      version: '1.0.0',
    };
    downloadJson(exportData, `strategy-${strategy.id}.json`);
    toast.success('Strategy exported!');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readJsonFile<BettingStrategy>(file);
      if (!data.name || !data.steps) {
        throw new Error('Invalid strategy file');
      }

      const importedStrategy: BettingStrategy = {
        ...data,
        id: `imported-${Date.now()}`,
        isPreloaded: false,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      const success = saveStrategy(importedStrategy);
      if (success) {
        toast.success('Strategy imported!');
        setUserStrategies(getUserStrategies());
      } else {
        toast.error('Failed to save imported strategy');
      }
    } catch (error) {
      toast.error('Invalid strategy file');
    }

    event.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Strategy Library</h1>
          <p className="text-casino-muted">
            Browse, create, and manage your betting strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleCreateNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Strategy
          </Button>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="secondary"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {}}
              as="span"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </label>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-casino-muted" />
          <Input
            type="text"
            placeholder="Search strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({allStrategies.length})
          </Button>
          <Button
            variant={filter === 'preloaded' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('preloaded')}
          >
            Preloaded ({PRELOADED_STRATEGIES.length})
          </Button>
          <Button
            variant={filter === 'custom' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('custom')}
          >
            Custom ({userStrategies.length})
          </Button>
        </div>
      </div>

      {/* Strategy Grid */}
      {filteredStrategies.length === 0 ? (
        <Card variant="bordered" className="flex flex-col items-center justify-center py-16">
          <Search className="w-16 h-16 text-casino-muted mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Strategies Found</h3>
          <p className="text-casino-muted text-center max-w-md mb-6">
            {searchQuery
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first custom strategy to get started.'}
          </p>
          {!searchQuery && (
            <Button variant="primary" onClick={handleCreateNew}>
              Create Strategy
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="relative group">
              <StrategyCard
                strategy={strategy}
                onRun={handleRun}
                onEdit={!strategy.isPreloaded ? handleEdit : undefined}
                onDuplicate={handleDuplicate}
                onDelete={!strategy.isPreloaded ? handleDelete : undefined}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport(strategy)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Export strategy"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Strategy Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingStrategy(null);
        }}
        title={editingStrategy?.isPreloaded ? 'Edit Strategy' : 'Strategy Editor'}
        size="full"
      >
        {editingStrategy && (
          <StrategyBuilder
            strategy={editingStrategy}
            onSave={handleSave}
            onRun={(strategy) => {
              handleSave(strategy);
              handleRun(strategy);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
