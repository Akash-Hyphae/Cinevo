/**
 * Cinevo Comprehensive Concurrency & Booking Verification Test Suite
 * Tests atomic operations, TTL expiration, mutex locks, and race conditions.
 */

import assert from 'assert';
import dataStore from '../db/dataStore.js';

async function runTests() {
  console.log('🚀 [TEST SUITE] Starting Cinevo Core Verification Tests...\n');

  // Test 1: Seed data and Show initialization
  console.log('Test 1: Verifying seed data...');
  assert.ok(dataStore.movies.size > 0, 'Movies should be seeded');
  assert.ok(dataStore.cinemas.size > 0, 'Cinemas should be seeded');
  assert.ok(dataStore.shows.size > 0, 'Shows should be seeded');
  console.log(`✅ Test 1 Passed: ${dataStore.movies.size} movies, ${dataStore.cinemas.size} cinemas, ${dataStore.shows.size} shows.\n`);

  // Test 2: Atomic Concurrency Test (Two users request the exact same seat simultaneously)
  console.log('Test 2: Atomic Concurrency - Simultaneous reservation of the same seat...');
  const testShowId = 'show_3';
  const targetSeat = 'D6';

  // Ensure seat is clean
  dataStore.seatLocks.delete(`${testShowId}_${targetSeat}`);

  let user1Result = null;
  let user2Result = null;
  let user1Error = null;
  let user2Error = null;

  // Fire both requests simultaneously using Promise.all
  await Promise.all([
    dataStore
      .lockSeatsAtomically({
        showId: testShowId,
        seatIds: [targetSeat],
        userId: 'usr_concurrent_alice',
      })
      .then((res) => { user1Result = res; })
      .catch((err) => { user1Error = err; }),

    dataStore
      .lockSeatsAtomically({
        showId: testShowId,
        seatIds: [targetSeat],
        userId: 'usr_concurrent_bob',
      })
      .then((res) => { user2Result = res; })
      .catch((err) => { user2Error = err; }),
  ]);

  const successes = [user1Result, user2Result].filter(Boolean);
  const conflicts = [user1Error, user2Error].filter(Boolean);

  assert.strictEqual(successes.length, 1, 'Exactly ONE user must successfully acquire the lock');
  assert.strictEqual(conflicts.length, 1, 'The competing user must receive a 409 conflict error');
  assert.strictEqual(conflicts[0].status, 409, 'Error status must be 409 Conflict');
  console.log(`✅ Test 2 Passed: User who won secured lock. Competing user rejected with HTTP 409: "${conflicts[0].message}"\n`);

  // Test 3: Lock Expiration / TTL Verification
  console.log('Test 3: Lock Expiration & Auto-Release Verification...');
  const expiredSeat = 'E2';
  const lockKey = `${testShowId}_${expiredSeat}`;

  // Insert a lock with an expired lockExpiresAt timestamp (e.g. 10 seconds in the past)
  dataStore.seatLocks.set(lockKey, {
    showId: testShowId,
    seatId: expiredSeat,
    userId: 'usr_expired_holder',
    status: 'LOCKED',
    lockedAt: new Date(Date.now() - 360000), // 6 mins ago
    lockExpiresAt: new Date(Date.now() - 60000), // 1 min ago
  });

  // Check availability
  const seatState = dataStore.getSeatState(testShowId, expiredSeat);
  assert.strictEqual(seatState.status, 'AVAILABLE', 'Expired locked seat must immediately be evaluated as AVAILABLE');

  // Now another user attempts to lock the expired seat
  const freshLockResult = await dataStore.lockSeatsAtomically({
    showId: testShowId,
    seatIds: [expiredSeat],
    userId: 'usr_new_buyer',
  });
  assert.ok(freshLockResult.success, 'New user should successfully acquire the expired seat');
  console.log('✅ Test 3 Passed: Expired locks immediately allow re-booking.\n');

  // Test 4: Booking Creation and Idempotency
  console.log('Test 4: Booking Creation & Idempotency Key Handling...');
  const bookingSeats = ['F3', 'F4'];
  const testBuyer = 'usr_buyer_1';

  // First lock the seats
  await dataStore.lockSeatsAtomically({
    showId: testShowId,
    seatIds: bookingSeats,
    userId: testBuyer,
  });

  const idempotencyKey = 'idemp_unique_test_12345';
  const booking1 = await dataStore.createBooking({
    userId: testBuyer,
    showId: testShowId,
    seats: bookingSeats,
    idempotencyKey,
  });

  assert.ok(booking1._id, 'Booking must have an ID');
  assert.strictEqual(booking1.bookingStatus, 'PENDING');
  assert.strictEqual(booking1.seats.length, 2);

  // Re-submitting with identical idempotency key must return the exact same booking without creating a duplicate
  const booking2 = await dataStore.createBooking({
    userId: testBuyer,
    showId: testShowId,
    seats: bookingSeats,
    idempotencyKey,
  });

  assert.strictEqual(booking1._id, booking2._id, 'Idempotent request must return existing booking ID');
  console.log('✅ Test 4 Passed: Booking created and double-click idempotency preserved.\n');

  // Test 5: Payment Confirmation converts seats permanently to BOOKED
  console.log('Test 5: Payment Verification & Permanent Seat Conversion...');
  const confirmedBooking = await dataStore.confirmBookingPayment({
    bookingId: booking1._id,
    paymentId: 'pay_test_verified_999',
    orderId: booking1.orderId,
    signature: 'valid_sandbox_signature',
  });

  assert.strictEqual(confirmedBooking.bookingStatus, 'CONFIRMED');
  assert.strictEqual(confirmedBooking.paymentStatus, 'PAID');

  // Verify seat state in datastore is now BOOKED permanently
  const finalSeatState = dataStore.getSeatState(testShowId, 'F3');
  assert.strictEqual(finalSeatState.status, 'BOOKED', 'Confirmed seat must have BOOKED state');
  console.log('✅ Test 5 Passed: Payment confirmed and seats permanently marked as BOOKED.\n');

  console.log('🎉 ALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
