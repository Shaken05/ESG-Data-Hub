<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center px-4">
    <!-- Animated background elements -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-32 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

    <!-- Main content -->
    <div class="relative z-10 max-w-2xl mx-auto text-center">
      <!-- Logo/Icon -->
      <div class="mb-8">
        <div class="inline-block p-4 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl">
          <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
      </div>

      <!-- Heading -->
      <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
        ESG Data Hub
      </h1>

      <!-- Subheading -->
      <p class="text-xl md:text-2xl text-blue-100 mb-4">
        Environmental, Social & Governance Intelligence Platform
      </p>

      <!-- Description -->
      <p class="text-lg text-blue-200 mb-12 leading-relaxed">
        Centralize, analyze, and manage your ESG metrics with ease. Gain actionable insights to drive sustainable business practices.
      </p>

      <!-- Features list -->
      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
          <div class="text-3xl mb-2">📊</div>
          <h3 class="text-white font-semibold mb-2">Analytics</h3>
          <p class="text-blue-200 text-sm">Real-time ESG metrics tracking</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
          <div class="text-3xl mb-2">🔗</div>
          <h3 class="text-white font-semibold mb-2">Integration</h3>
          <p class="text-blue-200 text-sm">Connect your data sources seamlessly</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
          <div class="text-3xl mb-2">🎯</div>
          <h3 class="text-white font-semibold mb-2">Insights</h3>
          <p class="text-blue-200 text-sm">Actionable reports and recommendations</p>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/login"
          class="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
        >
          Sign In
        </router-link>
        <router-link
          to="/register"
          class="px-8 py-4 bg-blue-500 bg-opacity-40 text-white font-bold rounded-lg border border-white border-opacity-40 hover:bg-opacity-60 transition-all duration-200 transform hover:scale-105 backdrop-blur-lg"
        >
          Create Account
        </router-link>
      </div>

      <!-- Learning resources -->
      <div class="mt-16 flex flex-col sm:flex-row gap-4 justify-center text-sm">
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
      <div class="mt-12 text-blue-300 text-sm">
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
