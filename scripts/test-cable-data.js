#!/usr/bin/env node
/**
 * Test Script: Verify Cable Data Structure
 *
 * This script tests that the fallback cable data has the correct structure
 * expected by main-integrated.js
 */

import { FallbackDataSource } from '../src/services/dataSources/FallbackDataSource.js';

const REQUIRED_FIELDS = [
  'id',
  'name',
  'owner',
  'status',
  'landing_point_1',
  'landing_point_2',
  'capacity_tbps',
  'data_accuracy'
];

const REQUIRED_LANDING_POINT_FIELDS = [
  'location',
  'latitude',
  'longitude'
];

async function testCableData() {
  console.log('🔍 Testing Cable Data Structure\n');
  console.log('='.repeat(60));

  const fallback = new FallbackDataSource();
  const cables = await fallback.getCables();

  console.log(`\n✓ Loaded ${cables.length} cables\n`);

  let passedTests = 0;
  let failedTests = 0;
  const issues = [];

  // Test each cable
  cables.forEach((cable, index) => {
    console.log(`\nCable ${index + 1}: ${cable.name}`);
    console.log('-'.repeat(60));

    let cablePassed = true;

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (cable[field] === undefined || cable[field] === null) {
        console.log(`  ❌ Missing field: ${field}`);
        issues.push(`Cable "${cable.name}": Missing ${field}`);
        cablePassed = false;
        failedTests++;
      } else {
        console.log(`  ✓ ${field}: ${JSON.stringify(cable[field]).slice(0, 50)}`);
      }
    });

    // Check landing point 1
    if (cable.landing_point_1) {
      REQUIRED_LANDING_POINT_FIELDS.forEach(field => {
        if (cable.landing_point_1[field] === undefined || cable.landing_point_1[field] === null) {
          console.log(`  ❌ landing_point_1 missing: ${field}`);
          issues.push(`Cable "${cable.name}": landing_point_1 missing ${field}`);
          cablePassed = false;
          failedTests++;
        }
      });
    }

    // Check landing point 2
    if (cable.landing_point_2) {
      REQUIRED_LANDING_POINT_FIELDS.forEach(field => {
        if (cable.landing_point_2[field] === undefined || cable.landing_point_2[field] === null) {
          console.log(`  ❌ landing_point_2 missing: ${field}`);
          issues.push(`Cable "${cable.name}": landing_point_2 missing ${field}`);
          cablePassed = false;
          failedTests++;
        }
      });
    }

    // Validate coordinates
    if (cable.landing_point_1 && cable.landing_point_2) {
      const lat1 = cable.landing_point_1.latitude;
      const lng1 = cable.landing_point_1.longitude;
      const lat2 = cable.landing_point_2.latitude;
      const lng2 = cable.landing_point_2.longitude;

      if (lat1 < -90 || lat1 > 90) {
        console.log(`  ❌ Invalid latitude: ${lat1} (landing_point_1)`);
        issues.push(`Cable "${cable.name}": Invalid landing_point_1 latitude`);
        cablePassed = false;
        failedTests++;
      }

      if (lat2 < -90 || lat2 > 90) {
        console.log(`  ❌ Invalid latitude: ${lat2} (landing_point_2)`);
        issues.push(`Cable "${cable.name}": Invalid landing_point_2 latitude`);
        cablePassed = false;
        failedTests++;
      }

      if (lng1 < -180 || lng1 > 180) {
        console.log(`  ❌ Invalid longitude: ${lng1} (landing_point_1)`);
        issues.push(`Cable "${cable.name}": Invalid landing_point_1 longitude`);
        cablePassed = false;
        failedTests++;
      }

      if (lng2 < -180 || lng2 > 180) {
        console.log(`  ❌ Invalid longitude: ${lng2} (landing_point_2)`);
        issues.push(`Cable "${cable.name}": Invalid landing_point_2 longitude`);
        cablePassed = false;
        failedTests++;
      }
    }

    // Validate capacity
    if (cable.capacity_tbps && (cable.capacity_tbps < 0 || cable.capacity_tbps > 1000)) {
      console.log(`  ⚠️  Unusual capacity: ${cable.capacity_tbps} Tbps`);
    }

    if (cablePassed) {
      passedTests++;
      console.log('  ✅ All checks passed');
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary');
  console.log('-'.repeat(60));
  console.log(`Total Cables: ${cables.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / cables.length) * 100).toFixed(1)}%`);

  if (issues.length > 0) {
    console.log('\n❌ Issues Found:');
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All cables have correct data structure!');
    console.log('\n🎉 Ready for rendering on globe visualization');
    process.exit(0);
  }
}

// Run tests
testCableData().catch(error => {
  console.error('\n💥 Test failed with error:', error);
  process.exit(1);
});
