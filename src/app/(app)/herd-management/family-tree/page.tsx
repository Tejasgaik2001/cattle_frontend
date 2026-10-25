'use client';

import { useEffect, useState } from 'react';
import { cowsApi } from '@/lib/api/cows';
import type { Cow } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FamilyTreeNode {
    cow: Cow;
    children: FamilyTreeNode[];
    expanded: boolean;
}

export default function FamilyTreePage() {
    const router = useRouter();
    const [cows, setCows] = useState<Cow[]>([]);
    const [treeData, setTreeData] = useState<FamilyTreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFamilyTree();
    }, []);

    const fetchFamilyTree = async () => {
        try {
            setLoading(true);
            const data = await cowsApi.getFamilyTree();
            setCows(data);
            buildTree(data);
        } catch (err) {
            console.error('Failed to fetch family tree:', err);
            setError('Failed to load family tree data');
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (cows: Cow[]) => {
        // Create a map of all cows
        const cowMap = new Map<string, FamilyTreeNode>();
        
        // Initialize all nodes
        cows.forEach(cow => {
            cowMap.set(cow.id, {
                cow,
                children: [],
                expanded: true,
            });
        });

        // Build the tree structure
        const rootNodes: FamilyTreeNode[] = [];
        
        cows.forEach(cow => {
            const node = cowMap.get(cow.id);
            if (!node) return;

            if (cow.motherId) {
                const motherNode = cowMap.get(cow.motherId);
                if (motherNode) {
                    motherNode.children.push(node);
                } else {
                    // Mother not found, treat as root
                    rootNodes.push(node);
                }
            } else {
                // No mother, this is a root node
                rootNodes.push(node);
            }
        });

        // Sort children by date of birth
        const sortChildren = (node: FamilyTreeNode) => {
            node.children.sort((a, b) => 
                new Date(a.cow.dateOfBirth).getTime() - new Date(b.cow.dateOfBirth).getTime()
            );
            node.children.forEach(sortChildren);
        };

        rootNodes.forEach(sortChildren);
        setTreeData(rootNodes);
    };

    const toggleNode = (node: FamilyTreeNode) => {
        node.expanded = !node.expanded;
        setTreeData([...treeData]);
    };

    const renderNode = (node: FamilyTreeNode, level: number = 0) => {
        const hasChildren = node.children.length > 0;
        const statusColor = {
            active: 'bg-emerald-500',
            sold: 'bg-blue-500',
            deceased: 'bg-gray-500',
        }[node.cow.lifecycleStatus];

        return (
            <div key={node.cow.id} className="ml-4">
                <div 
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    onClick={() => hasChildren && toggleNode(node)}
                >
                    {hasChildren && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {node.expanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                    {!hasChildren && <div className="w-6" />}
                    
                    <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                    
                    <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                            {node.cow.name || node.cow.tagId}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {node.cow.tagId} • {node.cow.gender} • {node.cow.breed}
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(node.cow.dateOfBirth).toLocaleDateString()}
                    </div>

                    {hasChildren && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {node.children.length} {node.children.length === 1 ? 'calf' : 'calves'}
                        </div>
                    )}
                </div>

                {node.expanded && hasChildren && (
                    <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-6">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-500 dark:text-slate-400">Loading family tree...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Herd
                </Button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Family Tree</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    View the lineage and breeding relationships of your herd
                </p>
            </div>

            <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Herd Lineage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {treeData.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            No family tree data available. Add cows with mother relationships to build the tree.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {treeData.map(node => renderNode(node))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-6 bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Legend</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Sold</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Deceased</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
