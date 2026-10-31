'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactFamilyTree from 'react-family-tree';
import type { ExtNode } from 'relatives-tree/lib/types';
import type { PedigreeNode } from '@/types';
import { FamilyNode } from './FamilyNode';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NODE_WIDTH = 270;
export const NODE_HEIGHT = 160;

interface TreeCanvasProps {
    nodes: PedigreeNode[];
    rootId: string;
    onSelectRoot: (id: string) => void;
    onViewDetails: (node: PedigreeNode) => void;
}

export function TreeCanvas({
    nodes,
    rootId,
    onSelectRoot,
    onViewDetails,
}: TreeCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Center tree on mount or root change
    const centerTree = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Place initial root comfortably near center-top
        setPan({
            x: Math.max(20, rect.width / 2 - NODE_WIDTH / 2),
            y: Math.max(40, rect.height / 3 - NODE_HEIGHT / 2),
        });
        setZoom(1);
    }, []);

    useEffect(() => {
        centerTree();
    }, [rootId, centerTree]);

    // Handle mouse wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        setZoom((prev) => Math.min(2.0, Math.max(0.3, Number((prev + delta).toFixed(2)))));
    };

    // Pan mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const zoomIn = () => setZoom((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
    const zoomOut = () => setZoom((prev) => Math.max(0.3, Number((prev - 0.15).toFixed(2))));
    const resetZoom = () => {
        setZoom(1);
        centerTree();
    };

    const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

    if (!rootId || nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-slate-400">
                <p>No pedigree data available to render.</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[620px] overflow-hidden bg-slate-900/5 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner select-none">
            {/* Grid background effect */}
            <div 
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                    color: 'rgba(100, 116, 139, 0.25)',
                }}
            />

            {/* Interactive Pan/Zoom Canvas Area */}
            <div
                ref={containerRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`w-full h-full min-h-[620px] cursor-grab ${isDragging ? 'cursor-grabbing active' : ''} relative`}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                    className="absolute top-0 left-0"
                >
                    <ReactFamilyTree
                        nodes={nodes as any}
                        rootId={rootId}
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        renderNode={(node: ExtNode) => {
                            const meta = nodeMap.get(node.id);
                            const fullNode = {
                                ...(meta || {}),
                                id: node.id,
                                gender: meta?.gender || (node.gender as any),
                                parents: meta?.parents || [],
                                children: meta?.children || [],
                                siblings: meta?.siblings || [],
                                spouses: meta?.spouses || [],
                                tagNumber: meta?.tagNumber || node.id,
                                name: meta?.name || node.id,
                                bornOnFarm: meta?.bornOnFarm ?? true,
                                status: meta?.status || 'active',
                                isExternal: meta?.isExternal ?? false,
                                top: node.top,
                                left: node.left,
                                hasSubTree: node.hasSubTree,
                            };
                            return (
                                <FamilyNode
                                    key={node.id}
                                    node={fullNode}
                                    isRoot={node.id === rootId}
                                    onSelectRoot={onSelectRoot}
                                    onViewDetails={onViewDetails}
                                    style={{
                                        width: NODE_WIDTH,
                                        height: NODE_HEIGHT,
                                        position: 'absolute',
                                        transform: `translate(${node.left * (NODE_WIDTH / 2)}px, ${node.top * (NODE_HEIGHT / 2)}px)`,
                                    }}
                                />
                            );
                        }}
                    />
                </div>
            </div>

            {/* Floating Zoom & Canvas Controls */}
            <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1.5 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4" />
                </Button>

                <span className="text-xs font-mono font-bold px-2 text-slate-700 dark:text-slate-300 min-w-[50px] text-center">
                    {Math.round(zoom * 100)}%
                </span>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4" />
                </Button>

                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="h-8 px-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                    title="Reset to 100% and Center"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={centerTree}
                    className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Center Canvas"
                >
                    <Maximize2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Instruction tooltip badge */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                <Move className="w-3.5 h-3.5 text-emerald-600" />
                <span>Drag to pan • Click node to re-root • Scroll to zoom</span>
            </div>
        </div>
    );
}
