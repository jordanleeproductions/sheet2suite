'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Home,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  DollarSign,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { ProductSetupPluginProps } from '@/lib/core/activation/types';

export interface VaultSetupConfig {
  residenceName: string;
  propertyType: string;
  selectedRooms: string[];
  coverageLimit: number;
  deductible: number;
  jewelrySublimit: number;
  electronicsSublimit: number;
  toolsSublimit: number;
}

const DEFAULT_ROOMS = [
  'Living Room',
  'Master Bedroom',
  'Home Office',
  'Kitchen',
  'Garage & Workshop',
  'Basement & Storage',
  'Guest Bedroom',
  'Patio / Outdoor',
];

export default function VaultSetupWizard(props: ProductSetupPluginProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [residenceName, setResidenceName] = useState('Primary Residence');
  const [propertyType, setPropertyType] = useState('Single Family Home');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([
    'Living Room',
    'Master Bedroom',
    'Home Office',
    'Kitchen',
    'Garage & Workshop',
  ]);
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [coverageLimit, setCoverageLimit] = useState(100000);
  const [deductible, setDeductible] = useState(1000);
  const [jewelrySublimit, setJewelrySublimit] = useState(1500);
  const [electronicsSublimit, setElectronicsSublimit] = useState(5000);

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const addCustomRoom = () => {
    if (!customRoomInput.trim()) return;
    const trimmed = customRoomInput.trim();
    if (!selectedRooms.includes(trimmed)) {
      setSelectedRooms((prev) => [...prev, trimmed]);
    }
    setCustomRoomInput('');
  };

  const handleFinish = () => {
    const config: VaultSetupConfig = {
      residenceName: residenceName.trim() || 'Primary Residence',
      propertyType,
      selectedRooms,
      coverageLimit,
      deductible,
      jewelrySublimit,
      electronicsSublimit,
      toolsSublimit: 2500,
    };

    props.onComplete({
      weddingName: `${config.residenceName} Vault`,
      vaultConfig: config,
    });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--color-text, #0f172a)' }}>
      {/* Stepper Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
        {[
          { step: 1, label: 'Property Profile' },
          { step: 2, label: 'Rooms Setup' },
          { step: 3, label: 'Policy Limits' },
        ].map((item) => (
          <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                backgroundColor: currentStep >= item.step ? 'var(--color-primary, #0f172a)' : 'transparent',
                color: currentStep >= item.step ? '#ffffff' : 'var(--color-muted, #94a3b8)',
                border: currentStep >= item.step ? 'none' : '1px solid var(--color-border, #cbd5e1)',
              }}
            >
              {currentStep > item.step ? <Check size={14} /> : item.step}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: currentStep === item.step ? 700 : 500, color: currentStep === item.step ? 'var(--color-text, #0f172a)' : 'var(--color-muted, #94a3b8)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Property Profile */}
      {currentStep === 1 && (
        <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} /> Residence Details
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
              Name your property to organize this inventory vault.
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Residence Nickname
            </label>
            <input
              type="text"
              value={residenceName}
              onChange={(e) => setResidenceName(e.target.value)}
              placeholder="e.g. Maple Street Home, Main Residence"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '1rem',
                minHeight: '48px',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'var(--color-bg, #ffffff)',
                color: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Property Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {['Single Family Home', 'Condo / Apartment', 'Townhouse', 'Storage Unit / Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(type)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    minHeight: '44px',
                    borderRadius: '3px',
                    border: propertyType === type ? '1.5px solid var(--color-primary, #0f172a)' : '1px solid var(--color-border, #cbd5e1)',
                    backgroundColor: propertyType === type ? 'var(--color-bg-subtle, #f8fafc)' : 'transparent',
                    fontWeight: propertyType === type ? 700 : 500,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{type}</span>
                  {propertyType === type && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={props.onBack}
              style={{
                padding: '0.65rem 1.25rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                padding: '0.65rem 1.5rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
              }}
            >
              Configure Rooms <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Rooms Setup */}
      {currentStep === 2 && (
        <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} /> Select Initial Rooms
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
              Choose the rooms you want to catalogue first. You can always add more later.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {DEFAULT_ROOMS.map((room) => {
              const active = selectedRooms.includes(room);
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => toggleRoom(room)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    minHeight: '44px',
                    borderRadius: '3px',
                    border: active ? '1.5px solid var(--color-primary, #0f172a)' : '1px solid var(--color-border, #cbd5e1)',
                    backgroundColor: active ? 'var(--color-bg-subtle, #f8fafc)' : 'transparent',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{room}</span>
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>

          {/* Custom Room Entry */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={customRoomInput}
              onChange={(e) => setCustomRoomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRoom())}
              placeholder="Add custom room (e.g. Attic, Wine Cellar)"
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                fontSize: '1rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'var(--color-bg, #ffffff)',
                color: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={addCustomRoom}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'transparent',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                padding: '0.65rem 1.25rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
              }}
            >
              <ArrowLeft size={14} style={{ marginRight: '0.35rem' }} /> Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              style={{
                padding: '0.65rem 1.5rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
              }}
            >
              Policy Limits <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Policy Limits */}
      {currentStep === 3 && (
        <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} /> Insurance Coverage & Sub-Limits
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted, #64748b)' }}>
              Sheet2Vault alerts you when your valuable collections exceed standard policy caps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Coverage C Limit ($)
              </label>
              <input
                type="number"
                value={coverageLimit}
                onChange={(e) => setCoverageLimit(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '1rem',
                  minHeight: '48px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-border, #cbd5e1)',
                  backgroundColor: 'var(--color-bg, #ffffff)',
                  color: 'inherit',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deductible ($)
              </label>
              <input
                type="number"
                value={deductible}
                onChange={(e) => setDeductible(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  fontSize: '1rem',
                  minHeight: '48px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-border, #cbd5e1)',
                  backgroundColor: 'var(--color-bg, #ffffff)',
                  color: 'inherit',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '3px', border: '1px solid var(--color-border, #cbd5e1)', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={15} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Standard Policy Sub-Limits (Configurable)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--color-muted, #64748b)', display: 'block', fontSize: '0.75rem' }}>Jewelry Sub-Limit</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>${jewelrySublimit.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted, #64748b)', display: 'block', fontSize: '0.75rem' }}>Electronics Sub-Limit</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700 }}>${electronicsSublimit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                padding: '0.65rem 1.25rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: '1px solid var(--color-border, #cbd5e1)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
              }}
            >
              <ArrowLeft size={14} style={{ marginRight: '0.35rem' }} /> Back
            </button>
            <button
              type="button"
              disabled={props.isSubmitting}
              onClick={handleFinish}
              style={{
                padding: '0.65rem 1.75rem',
                minHeight: '44px',
                borderRadius: '3px',
                border: 'none',
                backgroundColor: 'var(--color-primary, #0f172a)',
                color: '#ffffff',
                fontWeight: 800,
                cursor: props.isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.9rem',
                opacity: props.isSubmitting ? 0.7 : 1,
              }}
            >
              {props.isSubmitting ? 'PROVISIONING DRIVE VAULT...' : 'PROVISION & LAUNCH VAULT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
