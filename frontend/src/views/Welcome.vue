<template>
  <div class="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -left-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute -top-20 -right-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-20 left-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <!-- Main content - single screen height -->
    <div class="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12">
      <!-- Logo/Icon -->
      <div class="mb-4 sm:mb-6">
        <div class="inline-block p-3 sm:p-4 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl">
          <svg class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
      </div>

      <!-- Heading -->
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight text-center">
        ESG Data Hub
      </h1>

      <!-- Subheading -->
      <p class="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-2 sm:mb-3 text-center max-w-xl">
        Environmental, Social & Governance Intelligence Platform
      </p>

      <!-- Description -->
      <p class="text-sm sm:text-base md:text-lg text-blue-200 mb-6 sm:mb-8 leading-relaxed text-center max-w-2xl">
        Centralize, analyze, and manage your ESG metrics with ease. Gain actionable insights to drive sustainable business practices.
      </p>

      <!-- Features list - compact grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-3xl">
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white border-opacity-20">
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">📊</div>
          <h3 class="text-white font-semibold mb-1 text-sm sm:text-base">Analytics</h3>
          <p class="text-blue-200 text-xs sm:text-sm">Real-time ESG metrics tracking</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white border-opacity-20">
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">🔗</div>
          <h3 class="text-white font-semibold mb-1 text-sm sm:text-base">Integration</h3>
          <p class="text-blue-200 text-xs sm:text-sm">Connect your data sources seamlessly</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white border-opacity-20">
          <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">🎯</div>
          <h3 class="text-white font-semibold mb-1 text-sm sm:text-base">Insights</h3>
          <p class="text-blue-200 text-xs sm:text-sm">Actionable reports and recommendations</p>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-sm sm:max-w-md mb-4 sm:mb-6">
        <router-link
          to="/login"
          class="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-xl text-sm sm:text-base"
        >
          Sign In
        </router-link>
        <router-link
          to="/register"
          class="px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 bg-opacity-40 text-white font-bold rounded-lg border border-white border-opacity-40 hover:bg-opacity-60 transition-all duration-200 transform hover:scale-105 backdrop-blur-lg text-sm sm:text-base"
        >
          Create Account
        </router-link>
      </div>

      <!-- Learning resources -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center text-xs sm:text-sm mb-4">
        <a
          href="#"
          @click.prevent="$router.push('/glossary')"
          class="text-blue-200 hover:text-white transition-colors"
        >
          📚 Glossary
        </a>
        <span class="text-blue-300 hidden sm:inline">•</span>
        <a
          href="#"
          @click.prevent="$router.push('/methodology')"
          class="text-blue-200 hover:text-white transition-colors"
        >
          🔬 Methodology
        </a>
        <span class="text-blue-300 hidden sm:inline">•</span>
        <a
          href="#"
          @click.prevent="$router.push('/about')"
          class="text-blue-200 hover:text-white transition-colors"
        >
          ℹ️ About
        </a>
      </div>

      <!-- Status indicator -->
      <div class="text-blue-300 text-xs sm:text-sm">
        <span class="inline-flex items-center">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
          Ready to help you achieve your ESG goals
        </span>
      </div>
    </div>

    <style scoped>
      @keyframes blob {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
      }

      .animate-blob {
        animation: blob 7s infinite;
      }

      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }
    </style>
  </div>
</template>

<script setup>
// Pure frontend component - no API calls needed
// This page loads instantly without backend dependency
</script>
