import React, { useState } from 'react';
import axios from 'axios';
import './StructureAnalyser.css';
import API_URL from './config';

const StructureAnalyser = () => {
  const [formData, setFormData] = useState({
    shape: 'Pyramid',
    structure_type: 'Solid',
    diameter: 200,
    weight: 10,
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? parseFloat(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAnalysisResult(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/analyze-structure`, formData);
      setAnalysisResult(response.data);
    } catch (err) {
      setError('An error occurred during analysis. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyser-container">
        <div className="panel">
            <div className="panel-title">Structure Analyser</div>
            <form onSubmit={handleSubmit}>
                <div className="control-group">
                    <label className="control-label">Shape</label>
                    <select name="shape" value={formData.shape} onChange={handleChange}>
                        <option value="Pyramid">Pyramid</option>
                        <option value="Cube">Cube</option>
                        <option value="Cuboid">Cuboid</option>
                        <option value="Sphere">Sphere</option>
                        <option value="Cylinder">Cylinder</option>
                        <option value="Cone">Cone</option>
                    </select>
                </div>
                <div className="control-group">
                    <label className="control-label">Structure Type</label>
                    <select name="structure_type" value={formData.structure_type} onChange={handleChange}>
                        <option value="Solid">Solid</option>
                        <option value="Honeycomb">Honeycomb</option>
                        <option value="Bone">Bone</option>
                    </select>
                </div>
                <div className="control-group">
                    <label className="control-label">Diameter (mm)</label>
                    <input
                        type="number"
                        name="diameter"
                        value={formData.diameter}
                        onChange={handleChange}
                    />
                </div>
                <div className="control-group">
                    <label className="control-label">Weight / Load (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>
        </div>
        <div className="panel">
            <div className="panel-title">Analysis Result</div>
            {error && <p className="error">{error}</p>}
            {analysisResult && (
            <div className="results">
                <p>Simulation Result: <span style={{ color: analysisResult.sim_result === 'failure' ? '#ff1744' : '#00e676', fontWeight: 700 }}>{analysisResult.sim_result.toUpperCase()}</span></p>
                <h4 style={{ color: '#00e5ff', marginTop: '15px', fontSize: '11px', letterSpacing: '2px' }}>DETAILED METRICS:</h4>
                <div style={{ padding: '10px', background: '#040d14', borderRadius: '4px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #0d3050' }}>
                        <span style={{ fontSize: '12px', color: '#4a8099' }}>Strength</span>
                        <span style={{ fontSize: '12px', color: '#c8e6f5' }}>{analysisResult.stats.strength}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #0d3050' }}>
                        <span style={{ fontSize: '12px', color: '#4a8099' }}>Max Load</span>
                        <span style={{ fontSize: '12px', color: '#c8e6f5' }}>{analysisResult.stats.max_load} kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #0d3050' }}>
                        <span style={{ fontSize: '12px', color: '#4a8099' }}>Efficiency</span>
                        <span style={{ fontSize: '12px', color: '#c8e6f5' }}>{analysisResult.stats.efficiency}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span style={{ fontSize: '12px', color: '#4a8099' }}>Load Ratio</span>
                        <span style={{ fontSize: '12px', color: analysisResult.stats.load_ratio > 0.8 ? '#ff1744' : '#00e5ff' }}>{(analysisResult.stats.load_ratio * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            )}
            {!analysisResult && !error && <p>Submit the form to see the analysis result.</p>}
        </div>
    </div>
  );
};

export default StructureAnalyser;
