
require 'fileutils'
require 'digest/sha1'
include FileUtils

SOUNDFONT = "./merlin_gmv22.sf2"        # Soundfont file path
OGGENC = `which oggenc`.chomp
LAME = `which lame`.chomp
FLUIDSYNTH = `which fluidsynth`.chomp
SOX = `which sox`.chomp

FLUIDSYNTH_RAW = "%s.raw"

Dir.glob("*.mid").each do |source|
  sourceesc = source.gsub(/([^A-Za-z0-9_\-.,:\/@\n])/n, "\\\\\\1")
  target = source[0...-3] + "wav"
  targetesc = target.gsub(/([^A-Za-z0-9_\-.,:\/@\n])/n, "\\\\\\1")
  unless File.exist?(source[0...-3] + "ogg")
    digest = Digest::SHA1.hexdigest source
    raw_file = FLUIDSYNTH_RAW % [digest]
    `#{FLUIDSYNTH} -C 1 -R 1 -g 0.5 -F #{raw_file} #{SOUNDFONT} #{sourceesc}`
    `#{SOX} -b 16 -c 2 -s -r 44100 #{raw_file} #{targetesc}`
    `#{OGGENC} -m 96 -M 192 #{targetesc}`
    `#{LAME} -v -b 96 -B 192 #{targetesc}`
    rm target
  end
end
